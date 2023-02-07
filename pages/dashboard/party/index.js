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
  const [socket, setSocket] = useState(null);
  const [socketID, setSocketID] = useState(null);
  const [chats, setChats] = useState([]);
  const [update, triggerUpdate] = useState(0);
  const [selectedHarth, setSelectedHarth] = useState(null);
  const [outsideDiceRoll, setOutsideDiceRoll] = useState({});
  const [isCaptureButtonActive, setisCaptureButtonActive] = useState(false);
  const [screenShareActive, setScreenShareActive] = useState(false);
  const [showChatPannel, setShowChatPannel] = useState(false);
  const [unreadMsg, setUnreadMsg] = useState(false);
  const [activeCallRoom, setActiveCallRoom] = useState({});
  const [callRooms, setCallRooms] = useState([]);
  const [userName, setUserName] = useState("");
  const [userIcon, setUserIcon] = useState("");
  const [roomId, setRoomId] = useState("");
  const [harthId, setHarthId] = useState("");
  const [isActiveScreenShare, setIsActiveScreenShare] = useState(false);

  const ownerData = useRef({});
  const PEERS = useRef([]);
  const audioSharePeer = useRef();
  const videoSharePeer = useRef();
  const ScreenSharePeer = useRef();
  const chatPannel = useRef(false);

  const localAudioStream = useRef();
  const localVideoStream = useRef();
  const localCaptureStream = useRef();
  const userInfo = useRef();

  const { comms } = useComms();

  const { width } = useSize();
  useEffect(() => {
    const container = document.getElementById("peerContainer");
    resize(container);
  }, [width, showChatPannel, chats, screenShareActive, isActiveScreenShare]);

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
            setCallRooms(groupCallRooms);
            break;
          case "GROUP_CALL_PEERS":
            PEERS.current = peers;
            triggerUpdate();
            break;
          default:
            break;
        }
      });
      socket.on("chat-update", (newMsg) => {
        if (newMsg?.code == 8) {
          removeElement(newMsg.socketID);
          remoteUserLeft(newMsg);
        }
        if (newMsg?.code == 9) {
          if (localVideoStream.current) {
            videoSharePeer.current.call(
              newMsg.videoPeer,
              localVideoStream.current
            );
          }
          if (localAudioStream.current) {
            audioSharePeer.current.call(
              newMsg.peerId,
              localAudioStream.current
            );
          }
          if (localCaptureStream.current) {
            ScreenSharePeer.current.call(
              newMsg.capturePeer,
              localCaptureStream.current
            );
          }
        }
        setChats((prevChats) => [newMsg, ...(prevChats || [])]);
      });
      socket.on("incoming-chat-message", (newMsg) => {
        if (newMsg?.code == 1) {
          if (localCaptureStream.current) {
            console.log("currently streaming and incoming remote");
            disconnectCaptures();
          }
        }
        if (newMsg?.code == 6) {
          removeElement(newMsg.videoPeer);
        }
        if (newMsg?.code == 4) {
          removeElement(newMsg.peerId);
        }
        if (newMsg?.code == 2) {
          removeElement(newMsg.capturePeer);
        }
        if (!chatPannel.current) {
          setUnreadMsg(true);
        }
        setChats((prevChats) => [newMsg, ...(prevChats || [])]);
      });
      socket.on("party-event", (data) => {
        setOutsideDiceRoll({ ...data });
        setTimeout(() => {
          setOutsideDiceRoll({});
        }, 3000);
      });
      socket.on("userInfo-update", (info) => {
        userInfo.current = info;
        if (info && ownerData.current) {
          let match = Object.values(info).find(
            (usr) => usr.screenShare === true
          );
          if (typeof isActiveScreenShare !== typeof match) {
            setIsActiveScreenShare(match);
          }
        }
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

  useEffect(() => {
    let tempactiveCallRoom = {};
    if (roomId) {
      tempactiveCallRoom = callRooms?.filter((room) => {
        return room.roomId === roomId;
      });
    }
    setActiveCallRoom(tempactiveCallRoom[0] || {});
  }, [callRooms]);

  useEffect(() => {
    if (harthId && comms && comms.length) {
      let harth = comms.find((harthObj) => harthObj._id == harthId);
      setSelectedHarth(harth);
    }
  }, [harthId, comms]);

  const getLocalAudioStream = async (
    constraints = {
      audio: { echoCancellation: true, noiseSuppression: true },
      video: false,
    }
  ) => {
    return new Promise((resolve) => {
      async function run() {
        try {
          let stream = await navigator.mediaDevices.getUserMedia(constraints);

          resolve(stream);
        } catch (error) {
          resolve(false);
        }
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
        try {
          let stream = await navigator.mediaDevices.getUserMedia(constraints);

          resolve(stream);
        } catch (error) {
          resolve(false);
        }
      }
      run();
    });
  };
  const getLocalCaptureStream = async (
    constraints = {
      video: {
        cursor: "always",
      },
      audio: false,
    }
  ) => {
    return new Promise((resolve) => {
      async function run() {
        try {
          let capture = await navigator.mediaDevices.getDisplayMedia(
            constraints
          );

          if (capture) {
            capture.getTracks().forEach((track) => {
              if (track) {
                track.onended = () => {
                  disconnectCaptures();
                };
              }
            });

            resolve(capture);
          } else {
            resolve(false);
          }
        } catch (error) {
          resolve(false);
          console.log("has canceled selection do something");
        }
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
      let obj = {
        userName,
        userIcon,
        peerId: peerid,
        socketID,
        roomId,
        harthId,
      };
      createVideoSharePeer(obj);
    });
    audioSharePeer.current.on("error", function (err) {
      audioSharePeer.current.reconnect();
    });
    audioSharePeer.current.on("call", async (call) => {
      call.answer();

      call.on("stream", (incomingStream) => {
        let peer = PEERS.current.find((p) => {
          return p.peerId == call.peer;
        });
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
      peerobj.capturePeer = peerid;
      joinRoomSocket(peerobj);
    });
    ScreenSharePeer.current.on("error", function (err) {
      ScreenSharePeer.current.reconnect();
    });
    ScreenSharePeer.current.on("call", async (call) => {
      call.answer();

      call.on("stream", (incomingStream) => {
        let peer = PEERS.current.find((p) => p.capturePeer == call.peer);
        createCapture(incomingStream, peer, call);
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
    let audioStream = await getLocalAudioStream();
    if (audioStream) {
      localAudioStream.current = audioStream;
      peers.forEach((peer) => {
        if (peer.peerId !== audioSharePeer.current.id) {
          let options = {
            metadata: { streamID: audioStream.id, peer },
          };
          audioSharePeer.current.call(peer.peerId, audioStream, options);
        }
      });
      let newMsg = {
        value: `${userName} enabled audio`,
        code: 3,
        userName: userName,
        roomId: roomId,
        date: new Date(),
        creator_name: "Admin",
        flames: [],
        reactions: [],
        attachments: [],
        ...obj,
      };
      sendNewChatMessage(newMsg);
    }
  };
  const connectAudioToUsers = async () => {
    let audioStream = await getLocalAudioStream();
    if (audioStream) {
      localAudioStream.current = audioStream;
      PEERS.current.forEach((peer) => {
        if (peer.peerId !== audioSharePeer.current.id) {
          let options = {
            metadata: { streamID: audioStream.id, peer },
          };
          audioSharePeer.current.call(peer.peerId, audioStream, options);
        }
      });
      let newMsg = {
        value: `${userName} enabled audio`,
        code: 3,
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
    }
  };
  const connectVideoToUsers = async () => {
    let videoStream = await getLocalVideoStream();
    if (videoStream) {
      localVideoStream.current = videoStream;
      createLocalVideo(videoStream);
      PEERS.current.forEach((peer) => {
        if (peer.videoPeer !== videoSharePeer.current.id) {
          let options = { metadata: { streamID: videoStream.id } };
          videoSharePeer.current.call(peer.videoPeer, videoStream, options);
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
    }
  };
  const connectCaptureToUsers = async () => {
    let captureStream = await getLocalCaptureStream();
    if (captureStream) {
      localCaptureStream.current = captureStream;
      createCapture(captureStream, ownerData.current);
      PEERS.current.forEach((peer) => {
        if (peer.capturePeer !== ScreenSharePeer.current.id) {
          let options = { metadata: { streamID: captureStream.id } };

          ScreenSharePeer.current.call(
            peer.capturePeer,
            captureStream,
            options
          );
        }
      });
      let newMsg = {
        value: `${userName} enabled screen share`,
        code: 1,
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
    }
  };
  const remoteUserLeft = (data) => {
    console.log("closing connections for ", data);
    if (audioSharePeer.current) {
      for (let conns in audioSharePeer.current.connections) {
        audioSharePeer.current.connections[conns].forEach((conn) => {
          if (data.peerId === conns) {
            try {
              conn.peerConnection?.close();
              if (conn.close) conn.close();
            } catch (error) {
              console.log(error);
            }
          }
        });
      }
    }
    if (videoSharePeer.current) {
      for (let conns in videoSharePeer.current.connections) {
        videoSharePeer.current.connections[conns].forEach((conn) => {
          if (data.videoPeer === conns) {
            try {
              conn.peerConnection?.close();
              if (conn.close) conn.close();
            } catch (error) {
              console.log(error);
            }
          }
        });
      }
    }
    if (ScreenSharePeer.current) {
      for (let conns in ScreenSharePeer.current.connections) {
        ScreenSharePeer.current.connections[conns].forEach((conn) => {
          if (data.capturePeer === conns) {
            try {
              conn.peerConnection?.close();
              if (conn.close) conn.close();
            } catch (error) {
              console.log(error);
            }
          }
        });
      }
    }
  };
  const disconnectVideos = () => {
    for (let conns in videoSharePeer.current.connections) {
      videoSharePeer.current.connections[conns].forEach((conn) => {
        if (conn.metadata?.streamID == localVideoStream.current.id) {
          if (conn.close) conn.close();
        }
      });
    }
    const tracks = localVideoStream.current.getTracks();
    tracks.forEach((track) => {
      track.stop();
    });
    removeElement(localVideoStream.current.id);
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
  const disconnectAudios = () => {
    for (let conns in audioSharePeer.current.connections) {
      audioSharePeer.current.connections[conns].forEach((conn) => {
        if (conn.metadata?.streamID == localAudioStream.current.id) {
          if (conn.close) conn.close();
        }
      });
    }
    const tracks = localAudioStream.current.getTracks();
    tracks.forEach((track) => {
      track.stop();
    });
    localAudioStream.current = null;
    let newMsg = {
      value: `${userName} disconnected audio`,
      code: 4,
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
  const disconnectCaptures = () => {
    for (let conns in ScreenSharePeer.current.connections) {
      ScreenSharePeer.current.connections[conns].forEach((conn) => {
        if (conn.metadata?.streamID == localCaptureStream.current.id) {
          if (conn.close) conn.close();
        }
      });
    }
    const tracks = localCaptureStream.current.getTracks();
    tracks.forEach((track) => {
      track.stop();
    });
    localCaptureStream.current = null;
    removeElement(ownerData.current?.capturePeer);
    let newMsg = {
      value: `${userName} disconnected screen share`,
      code: 2,
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
  const toggleAudio = async () => {
    if (localAudioStream.current) {
      disconnectAudios();
    } else {
      connectAudioToUsers();
    }
  };
  const toggleCapture = async () => {
    if (localCaptureStream.current) {
      setScreenShareActive(false);
      disconnectCaptures();
    } else {
      setScreenShareActive(true);
      connectCaptureToUsers();
    }
  };
  const sendNewChatMessage = (message) => {
    socket &&
      socket.emit("send-chat-message", message, () => {
        setChats((prevChats) => [message, ...(prevChats || [])]);
      });
  };
  const createLocalVideo = (incomingStream, peer, call) => {
    let existingVideoContainer = document.getElementById(incomingStream.id);
    if (!existingVideoContainer) {
      let parentContainer = document.getElementById("video-container");
      // if (!parentContainer) {
      //     parentContainer = document.createElement("div");
      //     parentContainer.className = styles.ownerVideo;

      //     // let nameContainer = document.createElement("p");
      //     // var nameText = document.createTextNode(peer?.name);
      //     // nameContainer.className = styles.peerName;
      //     // nameContainer.appendChild(nameText);
      //     // parentContainer.append(nameContainer);
      //     const roomContainer = document.getElementById("peerContainer");
      //     roomContainer.append(parentContainer);
      // }

      const videoContainer = document.createElement("div");
      const video = document.createElement("video");
      videoContainer.id = incomingStream.id;
      videoContainer.className = styles.ownerVideo;
      video.srcObject = incomingStream;
      video.autoplay = true;
      video.muted = true;
      video.className = "video";
      video.playsInline = true;
      videoContainer.appendChild(video);
      parentContainer.appendChild(videoContainer);
    }
  };
  const createVideo = (incomingStream, peer, call) => {
    let existingVideoContainer = document.getElementById(peer?.videoPeer);
    if (!existingVideoContainer) {
      let parentContainer = document.getElementById(peer.socketID);
      if (!parentContainer) {
        parentContainer = document.createElement("div");
        parentContainer.id = peer.socketID;
        parentContainer.className = styles.videoContainer;

        const profileImage = document.createElement("img");
        profileImage.src = peer?.img;
        profileImage.className = styles.peerImage;
        parentContainer.append(profileImage);
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
      video.muted = true;
      video.className = "video";
      video.playsInline = true;
      videoContainer.appendChild(video);
      parentContainer.appendChild(videoContainer);
    }
  };
  const createAudio = (incomingStream, peer, call) => {
    console.log(peer);
    let existingVideoContainer = document.getElementById(peer?.peerId);
    if (!existingVideoContainer) {
      let parentContainer = document.getElementById(peer?.socketID);
      if (!parentContainer) {
        parentContainer = document.createElement("div");
        parentContainer.id = peer?.socketID;
        parentContainer.className = styles.videoContainer;

        const profileImage = document.createElement("img");
        profileImage.src = peer?.img;
        profileImage.className = styles.peerImage;
        parentContainer.append(profileImage);
        let nameContainer = document.createElement("p");
        var nameText = document.createTextNode(peer?.userName);
        nameContainer.className = styles.peerName;
        nameContainer.appendChild(nameText);
        parentContainer.append(nameContainer);

        const roomContainer = document.getElementById("peerContainer");
        roomContainer.append(parentContainer);
      }

      const audioContainer = document.createElement("div");
      const audio = document.createElement("video");
      audioContainer.id = peer?.peerId;
      audio.className = "audio";
      audio.style.width = "0px";
      audio.style.height = "0px";
      audio.style.overflow = "hidden";
      audio.srcObject = incomingStream;
      audio.autoplay = true;
      audio.playsInline = true;
      audioContainer.appendChild(audio);
      parentContainer.appendChild(audioContainer);
    }
  };
  const createCapture = (incomingStream, peer, call) => {
    let existingVideoContainer =
      document.getElementsByClassName("stream-window");
    if (existingVideoContainer) {
      try {
        for (let container of existingVideoContainer) {
          if (container) {
            try {
              container?.remove();
            } catch (error) {}
          }
        }
      } catch (error) {}
    }

    let parentContainer = document.getElementById("stream-window-container");

    const videoContainer = document.createElement("div");
    const video = document.createElement("video");
    videoContainer.className = styles.streamVideoContainer;
    videoContainer.id = peer?.capturePeer;
    video.srcObject = incomingStream;
    video.autoplay = true;
    video.muted = true;
    video.className = "video";
    video.playsInline = true;
    videoContainer.appendChild(video);
    parentContainer.appendChild(videoContainer);

    //I added this to trigger a screen share for the reciever as well.
    //whomever shares, the screen shoudl change to the same format for everyone.
    setScreenShareActive(true);
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
        let parentContainer = document.getElementById(peer?.socketID);
        if (!parentContainer) {
          parentContainer = document.createElement("div");
          parentContainer.id = peer?.socketID;
          parentContainer.className = styles.videoContainer;

          const profileImage = document.createElement("img");
          profileImage.src = peer?.img;
          profileImage.className = styles.peerImage;
          parentContainer.append(profileImage);
          const nameContainer = document.createElement("p");
          const nameText = document.createTextNode(peer?.name);
          nameContainer.className = styles.peerName;
          nameContainer.appendChild(nameText);
          parentContainer.append(nameContainer);
          const roomContainer = document.getElementById("peerContainer");
          roomContainer.append(parentContainer);
        }
      }
    });
  };
  const toggleChat = () => {
    setShowChatPannel((prevState) => {
      let newvalue = !prevState;
      if (newvalue === true) {
        setUnreadMsg(false);
      }
      chatPannel.current = newvalue;
      return newvalue;
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
  const diceRollHandler = (data) => {
    socket &&
      socket.emit(
        "user-dice-roll",
        { ...data, roomId, userName, userIcon },
        ({ chats }) => {
          setChats((prevChats) => [chats, ...(prevChats || [])]);
        }
      );
  };
  const changeVideoDevice = async (device) => {
    const tracks = localVideoStream.current?.getTracks();
    if (tracks && tracks.length) {
      tracks.forEach((track) => {
        if (track.kind === "video") {
          track.stop();
        }
      });

      let videoTrack;

      let newStream = await getLocalVideoStream({
        video: { deviceId: { exact: device.deviceId } },
        audio: false,
      });

      newStream.getTracks().forEach((trk) => {
        if (trk.kind == "video") {
          videoTrack = trk;
        }
      });

      try {
        for (let conns in videoSharePeer.current.connections) {
          videoSharePeer.current.connections[conns].forEach((conn) => {
            for (const sender of conn.peerConnection.getSenders()) {
              if (sender && sender.track.kind == "video") {
                console.log(sender, "sender");
                sender.replaceTrack(videoTrack);
              }
            }
          });
        }
      } catch (error) {
        console.log(error);
      }
    }
  };
  const changeAudioDevice = async (device) => {
    const tracks = localAudioStream.current?.getTracks();
    if (tracks && tracks.length) {
      tracks.forEach((track) => {
        if (track.kind === "audio") {
          track.stop();
        }
      });

      let audioTrack;

      let newStream = await getLocalAudioStream({
        audio: { deviceId: { exact: device.deviceId } },
        video: false,
      });

      newStream.getTracks().forEach((trk) => {
        if (trk.kind == "audio") {
          audioTrack = trk;
        }
      });

      try {
        for (let conns in audioSharePeer.current.connections) {
          audioSharePeer.current.connections[conns].forEach((conn) => {
            console.log(conns, conn);
            for (const sender of conn.peerConnection.getSenders()) {
              console.log(sender);
              if (sender && sender.track?.kind == "audio") {
                sender.replaceTrack(audioTrack);
              }
            }
          });
        }
      } catch (error) {
        console.log(error);
      }
    }
  };
  const toggleHDSwitch = () => {
    try {
      navigator.mediaDevices.getUserMedia({ audio: false, video: true });

      navigator.mediaDevices.enumerateDevices().then((devices) => {
        devices.forEach((device) => {
          try {
            if (device.kind == "videoinput") {
              console.log(device, device?.getCapabilities());
            }
          } catch (error) {}
        });
      });
    } catch (error) {
      setNotHDCapable(true);
    }
  };

  setPeerContainers();

  console.log(isActiveScreenShare, "isActiveScreenShare");

  return (
    <>
      <main className={styles.PartyWindow}>
        <GatherHeader
          gatheringName={activeCallRoom?.roomName}
          selectedHarthIcon={selectedHarth?.iconKey}
          toggleHDSwitch={toggleHDSwitch}
          leaveMethod={leaveRoom}
        />

        <section className={styles.ContentContainer} id="video-container">
          <div className={styles.alertContainer}>
            {Object.keys(outsideDiceRoll).length ? (
              <>
                <DiceAlert
                  rollResult={outsideDiceRoll?.number}
                  profileImage={outsideDiceRoll?.userIcon}
                  dice={outsideDiceRoll?.sides}
                />
              </>
            ) : null}
          </div>

          <section
            className={`
                        ${styles.peerContainer}
                        ${isActiveScreenShare && styles.peerContainerActive}
                        `}
            id="peerContainer"
          ></section>

          <section
            id="stream-window-container"
            className={`
                            ${styles.streamContainer}
                            ${
                              isActiveScreenShare &&
                              styles.streamContainerActive
                            }
                            `}
          ></section>

          <section
            className={` ${styles.ChatPanelContainer} ${
              showChatPannel ? styles.ChatPanelContainerOpen : null
            } `}
          >
            <ChatMessagesGeneral messages={chats} userName={userName} />
            <GeneralChatInput onSubmitHandler={chatSubmitHandler} />
          </section>
        </section>
        <>
          <GatherControlBar
            onLeaveHandler={leaveRoom}
            onToggleVideo={toggleVideo}
            onToggleAudio={toggleAudio}
            onToggleScreenShare={toggleCapture}
            diceRollHandler={diceRollHandler}
            onToggleChat={toggleChat}
            unreadMsg={unreadMsg}
            changeAudioDevice={changeAudioDevice}
            changeVideoDevice={changeVideoDevice}
            roomId={roomId}
            userInfo={(userInfo.current || {})[userName]}
          />
        </>
      </main>
    </>
  );
};

export default Party;
