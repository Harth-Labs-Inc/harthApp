import { useEffect, useRef, useState, useReducer } from "react";
import io from "socket.io-client";

import GatherControlBar from "../../../components/Gathering/GatherControlBar/GatherControlBar";
import GatherHeader from "../../../components/Gathering/GatherHeader/GatherHeader";
import { getTurnServers } from "../../../util/TURN";
import { useSize, useMobile } from "../../../contexts/mobile";
import { resize } from "../../../util/resize";
import { useComms } from "../../../contexts/comms";

import GeneralChatInput from "../../../components/ChatInput/ChatInputGeneral";
import ChatMessagesGeneral from "../../../components/ChatMessages/ChatMessagesGeneral";

import { DiceAlert } from "../../../components/Gathering/GatherTools/DiceAlert";

import styles from "./Party.module.scss";

const Party = () => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const userName = urlParams.get("user_name");
  const userIcon = urlParams.get("user_img");
  const roomId = urlParams.get("room_id");
  const harthId = urlParams.get("harth_id");

  const [socket, setSocket] = useState(null);
  const [socketID, setSocketID] = useState(null);
  const [chats, setChats] = useState([]);
  const [udpate, triggerUpdate] = useState(0);

  const ownerData = useRef({});
  const PEERS = useRef([]);
  const audioSharePeer = useRef();
  const videoSharePeer = useRef();
  const ScreenSharePeer = useRef();

  const localAudioStream = useRef();
  const localVideoStream = useRef();

  useEffect(() => {
    let urls = {
      development: "http://localhost:5000",
      production: "https://project-blarg-video-socket.herokuapp.com",
    };
    setSocket(
      io.connect(urls[process.env.NODE_ENV], {
        transports: ["websocket"],
      })
    );
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on("connection", () => {
        setSocketID(socket.id);
      });
      socket.on("broadcast", (data) => {
        let { event, groupCallRooms, peers } = data;
        switch (event) {
          case "GROUP_CALL_ROOMS":
            // setCallRooms(groupCallRooms);
            break;
          case "GROUP_CALL_PEERS":
            PEERS.current = peers;
            triggerUpdate();
            break;
          default:
            break;
        }
      });
      socket.on("chat-update", (chats, newMsg) => {
        console.log(newMsg, "chat-update");
        if (newMsg?.code == 8) {
          removeElement(newMsg.socketID);
        }
        if (newMsg?.code == 9 && localVideoStream.current) {
          videoSharePeer.current.call(
            newMsg.videoPeer,
            localVideoStream.current
          );
        }
        setChats(chats);
      });
      socket.on("incoming-chat-message", (newMsg) => {
        console.log(newMsg, "incoming-chat-message");

        if (newMsg?.code == 6) {
          removeElement(newMsg.videoPeer);
        }
        setChats((prevChats) => [newMsg, ...prevChats]);
      });
    }
  }, [socket]);

  useEffect(() => {
    if (socketID && !audioSharePeer.current) {
      if (userName && roomId) {
        createAudioSharePeer({ userName, userIcon, roomId });
      }
    }
  }, [socketID]);

  const getLocalAudioStream = async (
    constraints = {
      audio: { echoCancellation: true, noiseSuppression: true },
      video: false,
    }
  ) => {
    return new Promise((resolve) => {
      async function run() {
        let stream = await navigator.mediaDevices.getUserMedia(constraints);

        resolve(stream);
      }
      run();
    });
  };
  const getLocalVideoStream = async (
    constraints = {
      audio: false,
      video: true,
    }
  ) => {
    return new Promise((resolve) => {
      async function run() {
        let stream = await navigator.mediaDevices.getUserMedia(constraints);

        resolve(stream);
      }
      run();
    });
  };
  const createAudioSharePeer = () => {
    audioSharePeer.current = new window.Peer(undefined, {
      config: {
        iceServers: [
          ...getTurnServers(),
          {
            url: "stun:stun.1und1.de:3478",
          },
        ],
      },
    });

    audioSharePeer.current.on("open", async (peerid) => {
      let audioStream = await getLocalAudioStream();
      localAudioStream.current = audioStream;
      let obj = {
        userName,
        userIcon,
        peerId: peerid,
        socketID,
        roomId,
        localStreamId: (audioStream || {}).id || "",
        harthId,
      };
      createVideoSharePeer(obj);
    });
    audioSharePeer.current.on("error", function (err) {
      audioSharePeer.current.reconnect();
    });
    audioSharePeer.current.on("call", async (call) => {
      console.log("...receiving call", localAudioStream.current);
      call.answer(localAudioStream.current);

      call.on("stream", (incomingStream) => {
        console.log("incoming stream");
        let peer = call.metadata?.peer;
        createAudio(incomingStream, peer, call);
      });
    });
  };
  const createVideoSharePeer = (peerobj) => {
    videoSharePeer.current = new window.Peer(undefined, {
      config: {
        iceServers: [
          ...getTurnServers(),
          {
            url: "stun:stun.1und1.de:3478",
          },
        ],
      },
    });

    videoSharePeer.current.on("open", (peerid) => {
      peerobj.videoPeer = peerid;
      createScreenSharePeer(peerobj);
    });
    videoSharePeer.current.on("error", function (err) {
      videoSharePeer.current.reconnect();
    });
    videoSharePeer.current.on("call", async (call) => {
      call.answer();

      call.on("stream", (incomingStream) => {
        let peer = PEERS.current.find((p) => p.videoPeer == call.peer);
        createVideo(incomingStream, peer, call);
      });
    });
  };
  const createScreenSharePeer = (peerobj) => {
    let pID = "";
    ScreenSharePeer.current = new window.Peer(undefined, {
      config: {
        iceServers: [
          ...getTurnServers(),
          {
            url: "stun:stun.1und1.de:3478",
          },
        ],
      },
    });

    ScreenSharePeer.current.on("open", (peerid) => {
      pID = peerid;
      peerobj.capturePeer = peerid;
      joinRoomSocket(peerobj);
    });
    ScreenSharePeer.current.on("error", function (err) {
      ScreenSharePeer.reconnect();
    });
    ScreenSharePeer.current.on("call", async (call) => {
      call.answer();

      call.on("stream", (incomingStream) => {
        if (incomingStream) {
          addCaptureStream(incomingStream, call.peer);
        }
      });
    });
  };
  const joinRoomSocket = (obj) => {
    socket &&
      socket.emit("group-call-join-request", obj, ({ peers, chats }) => {
        PEERS.current = peers;
        ownerData.current = obj;
        triggerUpdate();
        connectToUsers(peers, obj);
        setChats(chats);
      });
  };
  const connectToUsers = async (peers, obj) => {
    if (audioSharePeer.current) {
      peers.forEach((peer) => {
        if (peer.peerId !== audioSharePeer.current.id) {
          let options = { metadata: { peer: { ...obj } } };
          console.log("...calling", localAudioStream.current);
          const call = audioSharePeer.current.call(
            peer.peerId,
            localAudioStream.current,
            options
          );
          call &&
            call.on("stream", (incomingStream) => {
              console.log("receiving answer...");
              createAudio(incomingStream, peer, call);
            });
        }
      });
    }
  };
  const connectVideoToUsers = async () => {
    let videoStream = await getLocalVideoStream();
    localVideoStream.current = videoStream;
    PEERS.current.forEach((peer) => {
      if (peer.videoPeer !== videoSharePeer.current.id) {
        videoSharePeer.current.call(peer.videoPeer, videoStream);
      }
    });
    let newMsg = {
      value: `${userName} enabled video`,
      code: 5,
      userName: userName,
      roomId: roomId,
      date: new Date(),
      creator_name: "Admin",
      flames: [],
      reactions: [],
      attachments: [],
      ...ownerData.current,
    };
    sendNewChatMessage(newMsg);
  };
  const disconnectVideos = () => {
    for (let conns in videoSharePeer.current.connections) {
      videoSharePeer.current.connections[conns].forEach((conn) => {
        if (conn.close) conn.close();
      });
    }
    const tracks = localVideoStream.current.getTracks();
    tracks.forEach((track) => {
      track.stop();
    });
    localVideoStream.current = null;
    let newMsg = {
      value: `${userName} disconnected video`,
      code: 6,
      userName: userName,
      roomId: roomId,
      date: new Date(),
      creator_name: "Admin",
      flames: [],
      reactions: [],
      attachments: [],
      ...ownerData.current,
    };
    sendNewChatMessage(newMsg);
    triggerUpdate();
  };
  const toggleVideo = async () => {
    if (localVideoStream.current) {
      disconnectVideos();
    } else {
      connectVideoToUsers();
    }
  };
  const sendNewChatMessage = (message) => {
    socket &&
      socket.emit("send-chat-message", message, () => {
        setChats((prevChats) => [message, ...prevChats]);
      });
  };
  const createVideo = (incomingStream, peer, call) => {
    console.log(incomingStream, peer, call);
    let existingVideoContainer = document.getElementById(peer.videoPeer);
    if (!existingVideoContainer) {
      let parentContainer = document.getElementById(peer.socketID);
      if (!parentContainer) {
        parentContainer = document.createElement("div");
        parentContainer.id = peer.socketID;
        parentContainer.className = styles.videoContainer;

        let nameContainer = document.createElement("p");
        var nameText = document.createTextNode(peer.name);
        nameContainer.className = styles.peerName;
        nameContainer.appendChild(nameText);
        parentContainer.append(nameContainer);
        const roomContainer = document.getElementById("peerContainer");
        roomContainer.append(parentContainer);
      }

      const videoContainer = document.createElement("div");
      const video = document.createElement("video");
      videoContainer.id = peer.videoPeer;
      video.srcObject = incomingStream;
      video.autoplay = true;
      video.controls = true;
      videoContainer.appendChild(video);
      parentContainer.appendChild(videoContainer);
    }
  };
  const createAudio = (incomingStream, peer, call) => {
    console.log(incomingStream, peer, call);
    let existingVideoContainer = document.getElementById(peer.peerId);
    if (!existingVideoContainer) {
      let parentContainer = document.getElementById(peer.socketID);
      if (!parentContainer) {
        parentContainer = document.createElement("div");
        parentContainer.id = peer.socketID;
        parentContainer.className = styles.videoContainer;

        let nameContainer = document.createElement("p");
        var nameText = document.createTextNode(peer.userName);
        nameContainer.className = styles.peerName;
        nameContainer.appendChild(nameText);
        parentContainer.append(nameContainer);
        const roomContainer = document.getElementById("peerContainer");
        roomContainer.append(parentContainer);
      }

      const audioContainer = document.createElement("div");
      const audio = document.createElement("audio");
      audioContainer.id = peer.peerId;
      audio.srcObject = incomingStream;
      audio.autoplay = true;
      audio.controls = true;
      audioContainer.appendChild(audio);
      parentContainer.appendChild(audioContainer);
    }
  };
  const removeElement = (id) => {
    let Container = document.getElementById(id);
    if (Container) {
      Container.remove();
    }
  };
  const setPeerContainers = () => {
    PEERS.current?.forEach((peer) => {
      if (socketID && peer && socketID !== peer?.socketID) {
        let parentContainer = document.getElementById(peer.socketID);
        if (!parentContainer) {
          parentContainer = document.createElement("div");
          parentContainer.id = peer.socketID;
          parentContainer.className = styles.videoContainer;

          let nameContainer = document.createElement("p");
          var nameText = document.createTextNode(peer.name);
          nameContainer.className = styles.peerName;
          nameContainer.appendChild(nameText);
          parentContainer.append(nameContainer);
          const roomContainer = document.getElementById("peerContainer");
          roomContainer.append(parentContainer);
        }
      }
    });
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
  const leaveRoom = () => {
    leaveGroupCall({ roomId, userName, socketID }, () => {
      window.close();
    });
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

          if (audioSharePeer.current) {
            audioSharePeer.current?.destroy();
          }
          if (videoSharePeer.current) {
            videoSharePeer.current?.destroy();
          }
          if (ScreenSharePeer.current) {
            ScreenSharePeer.current?.destroy();
          }
        });
    });
  };

  setPeerContainers();

  return (
    <>
      <main className={styles.PartyWindow}>
        <section className={styles.PartyWindowVideoContainer}>
          <GatherHeader />
          <div className={styles.PartyMainContent}>
            <section id="peerContainer"></section>
            <section id="stream-window-chat">
              <div className={styles.ChatPanelContainer}>
                <ChatMessagesGeneral messages={chats} userName={userName} />
                <GeneralChatInput onSubmitHandler={chatSubmitHandler} />
              </div>
            </section>
          </div>
          <section id="stream-window-capture-container"></section>
          <GatherControlBar
            onLeaveHandler={leaveRoom}
            onToggleVideo={toggleVideo}
            // onToggleAudio={toggleAudio}
          />
        </section>
      </main>
    </>
  );
};

export default Party;
