import { useEffect, useRef, useState, useReducer } from "react";
import io from "socket.io-client";

import { getTurnServers } from "../../../util/TURN";
import { useSize } from "../../../contexts/mobile";
import { ellapsedTime } from "../../../services/helper";

import ChatAttachment from "../../../components/ChatInput/chatAttachmentsGeneral";
import GeneralChatInput from "../../../components/ChatInput/ChatInputGeneral";

import PeerList from "./PeerList/PeerList";
import VoiceFooter from "./VoiceFooter/VoiceFooter";
import styles from "./Voice.module.scss";

let myPeer;
let groupStreams = {};
let chatPannel = false;
let userInfo = {};

const Voice = () => {
  let activeInterval;
  //chat

  const [unreadMsg, setUnreadMsg] = useState(false);
  const [newChatMsg, setNewChatMsg] = useState({});
  const [chats, setChats] = useState([]);

  const [userName, setUserName] = useState("");
  const [userIcon, setUserIcon] = useState("");
  const [roomId, setRoomId] = useState("");
  const [harthId, setHarthId] = useState("");
  const [socket, setSocket] = useState(null);
  const [socketID, setSocketID] = useState(null);
  const [callRooms, setCallRooms] = useState([]);
  const [groupCallStreams, setGroupCallStreams] = useState({});
  const [activeCallRoom, setActiveCallRoom] = useState({});
  const [roomChange, setRoomChange] = useState(0);
  const [activeTimer, setActiveTimer] = useState("");

  const [localStream, setLocalStream] = useState();
  const [localStreamChange, setLocalStreamChange] = useState(0);

  const [Peers, setPeers] = useState([]);
  const [muteOn, setMuteOn] = useState(false);

  const mainRef = useRef();
  // const localVidRef = useRef()
  // const groupStreamsRef = useRef([])
  // const chatInput = useRef()
  const peerContainerRef = useRef();

  useEffect(() => {
    let urls = {
      development: "http://localhost:5030",
      production: "https://project-blarg-video-socket.herokuapp.com",
    };
    setSocket(
      io.connect(urls[process.env.NODE_ENV], {
        transports: ["websocket"],
      })
    );

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const USRNM = urlParams.get("user_name");
    const USRIMG = urlParams.get("user_img");
    const ROOMID = urlParams.get("room_id");
    const HARTHID = urlParams.get("harth_id");
    if (USRIMG) {
      setUserIcon(USRIMG);
    }
    if (USRNM) {
      setUserName(USRNM);
    }
    if (ROOMID) {
      setRoomId(ROOMID);
    }
    if (HARTHID) {
      setHarthId(HARTHID);
    }
    startAudio();
  }, []);

  useEffect(() => {
    let tempactiveCallRoom = {};
    if (roomId) {
      tempactiveCallRoom = callRooms?.filter((room) => {
        console.log(room);
        console.log(roomId);
        return room.roomId === roomId;
      });
    }
    setActiveCallRoom(tempactiveCallRoom[0] || {});
  }, [callRooms]);

  useEffect(() => {
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        if (track.kind === "audio") {
          let enabled = track.enabled;
          setMuteOn(enabled);
        }
      });
    }
  }, [localStreamChange]);

  // ------- socket connection and listeners ------------

  useEffect(() => {
    if (socketID && localStream && !myPeer) {
      if (userName && roomId) {
        connectWithMyPeer({ userName, userIcon, roomId });
      }
    }
  }, [socketID, localStream]);

  useEffect(() => {
    if (socket) {
      socket.on("connection", () => {
        setSocketID(socket.id);
      });
      socket.on("broadcast", (data) => {
        let { event, groupCallRooms, peers } = data;
        switch (event) {
          case "GROUP_CALL_ROOMS":
            setCallRooms(groupCallRooms);
            break;
          case "GROUP_CALL_PEERS":
            setPeers(peers);
            break;
          default:
            break;
        }
      });

      socket.on("party-event", (data) => {
        setOutsideDiceRoll({ ...data });
      });

      socket.on("user-left", (data) => {
        if (myPeer) {
          for (let conns in myPeer.connections) {
            myPeer.connections[conns].forEach((conn, index, array) => {
              if (data.peerId === conns) {
                conn.peerConnection.close();
                if (conn.close) conn.close();
              }
            });
          }
        }
        removeVideo(data.peerId);
        delete groupStreams[data.peerId];
      });

      // chat
      socket.on("incoming-chat-message", (data) => {
        if (!chatPannel) {
          setUnreadMsg(true);
        }
        setChats((prevChats) => [...prevChats, data]);
      });
      socket.on("chat-update", (chats) => {
        setChats(chats);
      });
      socket.on("userInfo-update", (info) => {
        userInfo = info;

        let activeScreenShare = 0;
        let activeVideoStream = 0;

        Object.entries(info || {}).forEach(([usr, i]) => {
          if (i.connected) {
            if (i.screenShare) {
              activeScreenShare += 1;
            }
            if (i.video) {
              activeVideoStream += 1;
            }
          }
        });
      });
      // vote
      socket.on("incoming-vote", (data) => {
        setOutsideVoteCall({ ...data });
      });
    }
  }, [socket]);

  useEffect(() => {
    let tempCallRoom = {};
    callRooms.forEach((room) => {
      if (room.roomId === roomId) {
        tempCallRoom = room;
      }
    });
    setActiveTimer(ellapsedTime(tempCallRoom?.createdTime));

    activeInterval = setInterval(() => {
      setActiveTimer(ellapsedTime(tempCallRoom.createdTime));
    }, 60000);

    return () => clearInterval(activeInterval);
  }, [callRooms]);

  // ----------- media --------------

  useEffect(() => {
    if (localStream) {
      createVideo({ id: "owner", stream: localStream });
    }
  }, [localStream]);

  const startAudio = () => {
    getLocalStream("audio");
  };
  const stopAudioOnly = (stream) => {
    try {
      stream.getTracks().forEach((track) => {
        if (track.readyState == "live" && track.kind === "audio") {
          let enabled = track.enabled;
          track.enabled = !enabled;
          let newMsg = {};
          if (!enabled === false) {
            newMsg = {
              value: `${userName} disconnected audio`,
              code: 4,
              userName: userName,
              roomId: roomId,
              date: new Date(),
              creator_name: "Admin",
              flames: [],
              reactions: [],
              attachments: [],
            };
          } else {
            newMsg = {
              value: `${userName} enabled audio`,
              code: 3,
              userName: userName,
              roomId: roomId,
              date: new Date(),
              creator_name: "Admin",
              flames: [],
              reactions: [],
              attachments: [],
            };
          }
          sendNewChatMessage(newMsg);
          setLocalStreamChange((prev) => (prev += 1));
        }
      });
    } catch (error) {}
  };

  const toggleAudio = () => {
    if (!localStream) {
      startAudio();
    } else {
      try {
        localStream.getTracks().forEach((track) => {
          if (track.kind === "audio") {
            stopAudioOnly(localStream);
          }
        });
      } catch (error) {}
    }
    setLocalStreamChange((prev) => (prev += 1));
    setMuteOn((prev) => !prev);
  };

  const getLocalStream = async () => {
    let stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });

    setLocalStreamChange((prev) => (prev += 1));
    setLocalStream(stream);
  };

  const addVideoStream = (incomingStream, peerid) => {
    setGroupCallStreams((prevStreams) => {
      return { ...prevStreams, [peerid]: incomingStream };
    });

    groupStreams = {
      ...groupStreams,
      [peerid]: incomingStream,
    };

    createVideo({ id: peerid, stream: incomingStream });
  };

  // ------------ rooms -----------------

  const leaveRoom = () => {
    leaveGroupCall({ roomId, userName, socketID }, () => {
      window.close();
    });
  };
  const connectWithMyPeer = (data) => {
    let pID = "";
    myPeer = new window.Peer(undefined, {
      config: {
        iceServers: [
          ...getTurnServers(),
          {
            url: "stun:stun.1und1.de:3478",
          },
        ],
      },
    });

    myPeer.on("open", (peerid) => {
      pID = peerid;

      let { roomId, userIcon, userName } = data;
      let obj = {
        userName,
        userIcon,
        peerId: peerid,
        socketID,
        roomId,
        localStreamId: (localStream || {}).id || "",
        harthId,
      };
      joinGroupCall(obj);
    });

    myPeer.on("error", function (err) {
      myPeer.reconnect();
    });

    myPeer.on("disconnect", function (client) {
      removeVideo(client?.id);
    });

    myPeer.on("connection", function (dataConnection) {});
    myPeer.on("close", function (client) {
      removeVideo(client?.id);
    });

    myPeer.on("call", async (call) => {
      if (localStream) {
        call.answer(localStream);
      }

      call.on("stream", (incomingStream) => {
        if (incomingStream) {
          addVideoStream(incomingStream, call.peer);
        }
      });
      call.on("close", () => {
        removeVideo(call.peer);
      });
      call.on("error", () => {
        removeVideo(call.peer);
      });
    });
  };
  const joinGroupCall = (obj) => {
    userWantsToJoinGroupCall(obj);
  };
  const userWantsToJoinGroupCall = (data) => {
    socket &&
      socket.emit("group-call-join-request", data, ({ peers, chats }) => {
        connectToUsers(peers);
        setChats(chats);
      });
  };
  const connectToUsers = async (peers) => {
    if (myPeer) {
      peers.forEach((peer) => {
        if (peer.peerId !== myPeer.id) {
          const call = myPeer.call(peer.peerId, localStream, {
            metadata: { id: myPeer.id, userName, userIcon },
          });
          call &&
            call.on("stream", (incomingStream) => {
              if (incomingStream) {
                addVideoStream(incomingStream, peer.peerId);
              }
            });
        }
      });
    }
  };

  const leaveGroupCall = (data) => {
    return new Promise((res, rej) => {
      socket &&
        socket.emit("group-call-user-left", data, (response) => {
          if (response.ok) {
            res(true);
            try {
              window.close();
            } catch (error) {}
            let urls = {
              test: `http://localhost:3000`,
              development: "http://localhost:3000/",
              production: "https://harth.vercel.app/",
            };

            window.location.replace(urls[process.env.NODE_ENV]);
          }

          if (myPeer) {
            myPeer.destroy();
          }
        });
    });
  };
  // ------------ chat -----------------
  const sendNewChatMessage = (message) => {
    socket &&
      socket.emit("send-chat-message", message, () => {
        setChats((prevChats) => [...prevChats, message]);
      });
  };
  const chatInputHandler = (e) => {
    const { value } = e.target;
    setNewChatMsg({ value });
  };
  const chatSubmitHandler = (msg) => {
    let message = {
      ...msg,
      roomId: roomId,
      code: 0,
      date: new Date(),
      creator_name: userName,
      userName: userName,
      creator_image: userIcon,
    };

    sendNewChatMessage(message);
  };
  // const chatSubmitHandler = (e) => {
  //   e.preventDefault()
  //   let message = {
  //     ...newChatMsg,
  //     roomId: roomId,
  //     code: 0,
  //     date: new Date(),
  //     creator_name: userName,
  //     userName: userName,
  //     creator_image: userIcon,
  //     flames: [],
  //     reactions: [],
  //     attachments: [],
  //   }

  //   sendNewChatMessage(message)
  // }
  const chatClassname = (creator) => {
    if (creator === "Admin") {
      return "admin";
    }
    if (creator === userName) {
      return "self";
    }
    return "incoming";
  };

  const toBase64 = (arr) => {
    var arrayBufferView = new Uint8Array(arr);
    var blob = new Blob([arrayBufferView], { type: "image/jpeg" });
    var urlCreator = window.URL || window.webkitURL;
    var imageUrl = urlCreator.createObjectURL(blob);
    var img = document.querySelector("#photo");
    if (img) {
      img.src = imageUrl;
    }
  };

  const ChatStructure = ({ chat }) => {
    const date = new Date(chat.date);
    return (
      <>
        {chat.attachments.length ? (
          <ChatAttachment attachments={chat.attachments} />
        ) : null}

        <p>{chat.value}</p>
        <span>
          <img
            src={chat.creator_image}
            alt={chat.creator_name}
            loading="lazy"
          />
          {date.getTime()}
        </span>
      </>
    );
  };
  // --------------- screen share ----------

  // new video
  const createVideo = (createObj) => {
    setRoomChange((prevState) => (prevState += 1));
    if (!createObj) {
      createObj = {};
    }
    let match = document.getElementById(createObj?.id);

    if (!match) {
      const roomContainer = document.getElementById("peerContainer");

      const videoContainer = document.createElement("div");

      if (videoContainer) {
        videoContainer.id = `parent-${createObj?.id}`;
        videoContainer.classList.add(`${styles.videoParent}`);
        const video = document.createElement("video");
        video.srcObject = createObj?.stream;
        video.id = createObj?.id;
        video.classList.add(`${styles.peerVideo}`);
        video.autoplay = true;
        if (createObj?.id === "owner") {
          video.muted = true;
          videoContainer.classList.add(`${styles.ownerVideo}`);
        }
        videoContainer.appendChild(video);
        roomContainer.append(videoContainer);
      }
    } else {
      let el = document.getElementById(createObj?.id);
      if (el) {
        el.srcObject = createObj?.stream;
      }
    }
  };

  const removeVideo = (id) => {
    setRoomChange((prevState) => (prevState += 1));
    if (id) {
      const video = document.getElementById(`parent-${id}`);
      if (video) video.remove();
    }
  };

  console.log(userInfo);

  return (
    <main id="VoiceGathering" className={styles.voiceGathering} ref={mainRef}>
      <img id="photo" loading="lazy"></img>
      <section className={styles.voiceGatheringPeers}>
        <div className={styles.voiceGatheringHeader}>
          <p className={styles.voiceGatheringHeaderTitle}>
            {activeCallRoom && activeCallRoom?.roomName
              ? `${activeCallRoom?.roomName}`
              : null}
          </p>
          {activeTimer} Active
        </div>
        <PeerList
          myPeer={myPeer}
          peers={Peers}
          toggleAudio={toggleAudio}
          userInfo={userInfo}
          groupStreams={groupStreams}
        />
        <VoiceFooter
          leaveRoom={leaveRoom}
          toggleAudio={toggleAudio}
          muteOn={muteOn}
        />
      </section>

      <section id={styles.VoiceVideoContainer}>
        <section
          ref={peerContainerRef}
          id="peerContainer"
          className={`${styles.peerContainer}`}
        ></section>
      </section>
      <section className={styles.voiceGatheringChat}>
        <ul className={styles.voiceGatheringMessages}>
          {chats.map((chat, index) => {
            return (
              <li
                key={index}
                className={styles[chatClassname(chat.creator_name)]}
                id={chat.creator_name + index}
              >
                {chat.creator_name === "Admin" ? (
                  chat.value
                ) : (
                  <ChatStructure chat={chat} />
                )}
              </li>
            );
          })}
        </ul>
        <GeneralChatInput onSubmitHandler={chatSubmitHandler} />
      </section>
    </main>
  );
};

export default Voice;
