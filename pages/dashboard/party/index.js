import { useContext, useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import axios from "axios";
import Script from "next/script";
import { generateID } from "../../../services/helper";
import { useSize, MobileContext } from "../../../contexts/mobile";
import { resize } from "../../../util/resize";

import GatherControlBar from "../../../components/Gathering/GatherControlBar/GatherControlBar";
import GatherHeader from "../../../components/Gathering/GatherHeader/GatherHeader";
import ChatInputGeneral from "../../../components/ChatInput/ChatInputGeneral";
import ChatMessagesGeneral from "../../../components/ChatMessages/ChatMessagesGeneral";
import { DiceAlert } from "../../../components/Gathering/GatherTools/DiceAlert";

import styles from "./Party.module.scss";
import { envUrls, videoSocketUrls } from "../../../constants/urls";
import { useAuth } from "contexts/auth";
import { getHarthByID } from "requests/community";
import { compressImage, getUploadURL, putImageInBucket } from "requests/s3";
import { SpinningLoader } from "../../../components/Common/SpinningLoader/SpinningLoader";

/* eslint-disable */

const Party = ({ closeActiveRoomFromMobile, minimizeHandler }) => {
  const [socket, setSocket] = useState(null);
  const [socketID, setSocketID] = useState(null);
  const [chats, setChats] = useState([]);
  const [update, triggerUpdate] = useState(0);
  const [mapUpdate, triggerMapUpdate] = useState(0);
  const [uploadingAttachments, setUploadingAttachments] = useState([]);
  const [selectedHarth, setSelectedHarth] = useState(null);
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
  const [TurnServers, setTurnServers] = useState([]);
  const [diceAlerts, setDiceAlerts] = useState([]);
  const [userID, setUserID] = useState("");
  const [isFinishedInitialSetup, setIsFinishedInitialSetup] = useState(false);

  const ownerData = useRef({});
  const PEERS = useRef([]);
  const audioSharePeer = useRef();
  const videoSharePeer = useRef();
  const ScreenSharePeer = useRef();
  const chatPannel = useRef(false);

  const localAudioStream = useRef();
  const localStreamSource = useRef();
  const localStreamAnalyser = useRef();
  const detectSpeakingIntervalId = useRef(null);
  const localVideoStream = useRef();
  const localCaptureStream = useRef();
  const userInfo = useRef();

  const { user, loading, Comms } = useAuth();
  const { width } = useSize();
  const { isMobile } = useContext(MobileContext);

  useEffect(() => {
    return stopDetectSpeaking;
  }, []);

  useEffect(() => {
    const container = document.getElementById("peerContainer");
    if (container) {
      resize(container);
    }
  }, [width, showChatPannel, chats, screenShareActive, isActiveScreenShare]);

  useEffect(() => {
    if (!loading && user) {
      let ROOMID;
      let HARTHID;
      if (isMobile) {
        const storedActiveRoom = sessionStorage.getItem("active_room");
        try {
          const parsedRoom = JSON.parse(storedActiveRoom);
          ROOMID = parsedRoom.room_id;
          HARTHID = parsedRoom.harth_id;
        } catch (error) {
          console.log(error);
          ROOMID = null;
          HARTHID = null;
        }
      } else {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        ROOMID = urlParams.get("room_id");
        HARTHID = urlParams.get("harth_id");
      }

      async function getHarth(id) {
        const results = await getHarthByID(id);
        if (results.ok) {
          let creator = results?.data?.users.find(
            (usr) => usr.userId === user._id
          );
          if (creator) {
            setHarthId(id);
            if (creator?.iconKey) {
              setUserIcon(creator?.iconKey);
            }
            if (creator?.name) {
              setUserName(creator?.name);
            }
            if (creator?._id) {
              setUserID(creator?._id);
            }
            const URLS = videoSocketUrls;
            axios
              .get(`${URLS[process.env.NODE_ENV]}/api/get-turn-credentials`)
              .then((responseData) => {
                setTurnServers(responseData.data.token.iceServers);
                setSocket(
                  io.connect(URLS[process.env.NODE_ENV], {
                    transports: ["websocket"],
                  })
                );
              })
              .catch((err) => {
                console.error(err);
              });
          }
        }
      }
      if (ROOMID) {
        setRoomId(ROOMID);
      }
      if (HARTHID) {
        getHarth(HARTHID);
      }
    }
  }, [loading, user, isMobile]);

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
            triggerLocalPositionCheck(peers);
            triggerUpdate();
            break;
          default:
            break;
        }
      });
      socket.on("chat-update", (newMsg) => {
        if (newMsg?.code == 8) {
          removeElement(newMsg.socketID);
          removeElement(newMsg.capturePeer);
          remoteUserLeft(newMsg);
          triggerLocalPositionCheck(PEERS.current);
        }
        if (newMsg?.code == 9) {
          if (newMsg?.userID == user._id) {
            if (localVideoStream.current) {
              disconnectVideos();
            }
            if (localAudioStream.current) {
              disconnectAudios();
            }
            if (localCaptureStream.current) {
              disconnectCaptures();
            }
            let newMsg = {
              value: `${userName} alternate device detected`,
              code: 22,
              userName: userName,
              roomId: roomId,
              date: new Date(),
              creator_name: "Admin",
              flames: [],
              reactions: [],
              attachments: [],
              hidden: true,
              ...ownerData.current,
            };
            sendNewChatMessage(newMsg);
            leaveGroupCall();
          }

          if (localVideoStream.current) {
            videoSharePeer.current.call(
              newMsg.videoPeer,
              localVideoStream.current
            );
          }
          if (localAudioStream.current) {
            let options = {
              metadata: {
                streamID: localAudioStream.current.id,
                priority: "high",
                type: "audio",
              },
              sdpSemantics: "unified-plan",
              prioritize: ["audio", "video"],
            };

            audioSharePeer.current.call(
              newMsg.peerId,
              localAudioStream.current,
              options
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
            disconnectCaptures();
          }
        }
        if (newMsg?.code == 6) {
          for (let conns in videoSharePeer.current.connections) {
            videoSharePeer.current.connections[conns].forEach((conn) => {
              if (conn.metadata?.streamID == newMsg.deleteID) {
                if (conn.close) conn.close();
              }
            });
          }
          let parentContainer = document.getElementById(newMsg.socketID);
          if (parentContainer) {
            parentContainer.classList.remove(styles.videoActive);
          }
          removeElement(newMsg.videoPeer);
        }
        if (newMsg?.code == 4) {
          for (let conns in audioSharePeer.current.connections) {
            audioSharePeer.current.connections[conns].forEach((conn) => {
              if (conn.metadata?.streamID == newMsg.deleteID) {
                if (conn.close) conn.close();
              }
            });
          }
          removeElement(newMsg.peerId);
        }
        if (newMsg?.code == 2) {
          removeElement(newMsg.capturePeer);
          for (let conns in ScreenSharePeer.current.connections) {
            ScreenSharePeer.current.connections[conns].forEach((conn) => {
              if (conn.metadata?.streamID == newMsg.deleteID) {
                if (conn.close) conn.close();
              }
            });
          }
        }
        if (newMsg?.code == 22) {
          removeElement(newMsg?.socketID);
        }
        if (!chatPannel.current) {
          setUnreadMsg(true);
        }
        setChats((prevChats) => [newMsg, ...(prevChats || [])]);
      });
      socket.on("party-event", (data) => {
        setDiceAlerts((alerts) => [...alerts, data]);
      });
      socket.on("map-change", (data) => {
        triggerMapUpdate((prevValue) => (prevValue += 1));
      });
      socket.on("userInfo-update", (info) => {
        if (info && ownerData.current) {
          userInfo.current = info;
          if (info.code == "isTalking") {
            let userData = info[info?.userName];
            if (userData.isTalking) {
              let element = document.getElementById(info?.socketID);
              if (!element) {
                let myElement = document.getElementById(info?.peerId);
                if (myElement) {
                  myElement.style.border = "1px solid #e46eb1";
                }
              } else {
                element.style.border = "1px solid #e46eb1";
              }
            } else {
              let element = document.getElementById(info?.socketID);
              if (!element) {
                let myElement = document.getElementById(info?.peerId);
                if (myElement) {
                  myElement.style.border = "1px solid rgba(255, 255, 255, 0.1)";
                }
              } else {
                element.style.border = "1px solid rgba(255, 255, 255, 0.1)";
              }
            }
          } else {
            let match = Object.values(info).find(
              (usr) => usr.screenShare === true
            );
            if (typeof isActiveScreenShare !== typeof match) {
              setIsActiveScreenShare(match);
            }
          }
        }
      });
    }
  }, [socket]);

  useEffect(() => {
    if (socketID && !audioSharePeer.current) {
      if (userName && roomId && typeof window !== "undefined") {
        createPeerObjects({ userName, userIcon, roomId });
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
    if (harthId && Comms && Comms.length) {
      let harth = Comms.find((harthObj) => harthObj._id == harthId);
      setSelectedHarth(harth);
    }
  }, [harthId, Comms]);

  useEffect(() => {
    const element = document.getElementById("chatContainer");
    if (element && showChatPannel) {
      element.classList.add(styles.rendering);
      setTimeout(() => {
        element.classList.remove(styles.rendering);
        element.classList.add(styles.entered);
      }, 100);
    }

    return () => {
      if (element) {
        element.classList.remove(styles.entered);
        element.classList.remove(styles.rendering);
      }
    };
  }, [showChatPannel]);

  const triggerLocalPositionCheck = (peerlist = []) => {
    let peerLength = peerlist.length;
    let firstPeer = peerlist[0];
    try {
      if (peerLength <= 1 && firstPeer?.socketID) {
        let localParentContainer = document.getElementById("localContainer");
        let parentContainer = document.getElementById(firstPeer.socketID);
        if (localParentContainer) {
          removeElement("localContainer");
        }
        if (!parentContainer) {
          if (localVideoStream.current) {
            createVideo(localVideoStream.current, firstPeer);
          } else {
            parentContainer = document.createElement("div");
            parentContainer.id = firstPeer.socketID;
            parentContainer.className = styles.videoContainer;
            const profileImage = document.createElement("img");
            profileImage.src = firstPeer?.img;
            profileImage.className = styles.peerImage;
            parentContainer.append(profileImage);
            const nameContainer = document.createElement("p");
            const nameText = document.createTextNode(firstPeer?.name);
            nameContainer.className = styles.peerName;
            nameContainer.appendChild(nameText);
            parentContainer.append(nameContainer);
            const roomContainer = document.getElementById("peerContainer");
            roomContainer?.append(parentContainer);
          }
        }
      } else {
        let parentContainer = document.getElementById(
          ownerData.current?.socketID
        );
        if (parentContainer) {
          removeElement(ownerData.current?.socketID);
        }
        if (localVideoStream.current) {
          createLocalVideo(localVideoStream.current);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  const getLocalAudioStream = async (
    constraints = {
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        codec: "opus",
      },
      video: false,
    }
  ) => {
    return new Promise((resolve) => {
      async function run() {
        let lastUsedAudioDeviceID = localStorage.getItem(
          "lastUsedAudioDeviceID"
        );
        if (lastUsedAudioDeviceID) {
          constraints.audio.deviceId = {
            exact: lastUsedAudioDeviceID,
          };
          try {
            let stream = await navigator.mediaDevices.getUserMedia(constraints);

            try {
              const audioCtx = new AudioContext();
              localStreamSource.current =
                audioCtx.createMediaStreamSource(stream);
              localStreamAnalyser.current = audioCtx.createAnalyser();
              localStreamAnalyser.current.fftSize = 2048;
              localStreamSource.current.connect(localStreamAnalyser.current);

              startDetectSpeaking();
            } catch (error) {
              if (stream) {
                resolve(stream);
              }
              resolve(false);
            }
            resolve(stream);
          } catch (error) {
            try {
              delete constraints.audio.deviceId;
              let stream = await navigator.mediaDevices.getUserMedia(
                constraints
              );

              try {
                const audioCtx = new AudioContext();
                localStreamSource.current =
                  audioCtx.createMediaStreamSource(stream);
                localStreamAnalyser.current = audioCtx.createAnalyser();
                localStreamAnalyser.current.fftSize = 2048;
                localStreamSource.current.connect(localStreamAnalyser.current);

                startDetectSpeaking();
              } catch (error) {
                if (stream) {
                  resolve(stream);
                }
                resolve(false);
              }
              resolve(stream);
            } catch (error) {
              resolve(false);
            }
          }
        } else {
          try {
            let stream = await navigator.mediaDevices.getUserMedia(constraints);

            try {
              const audioCtx = new AudioContext();
              localStreamSource.current =
                audioCtx.createMediaStreamSource(stream);
              localStreamAnalyser.current = audioCtx.createAnalyser();
              localStreamAnalyser.current.fftSize = 2048;
              localStreamSource.current.connect(localStreamAnalyser.current);

              startDetectSpeaking();
            } catch (error) {
              if (stream) {
                resolve(stream);
              }
              resolve(false);
            }
            resolve(stream);
          } catch (error) {
            resolve(false);
          }
        }
      }
      run();
    });
  };
  const startDetectSpeaking = () => {
    if (detectSpeakingIntervalId.current !== null) {
      clearInterval(detectSpeakingIntervalId.current);
      detectSpeakingIntervalId.current = null;
    }

    const interval = 100;
    detectSpeakingIntervalId.current = setInterval(() => {
      const bufferLength = localStreamAnalyser.current?.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      localStreamAnalyser.current?.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((acc, val) => acc + val) / bufferLength;

      if (average > 10) {
        if (
          userInfo.current &&
          userInfo.current[userName] &&
          !userInfo.current[userName].isTalking
        ) {
          socket &&
            socket.emit(
              "set-user-is-speaking",
              {
                harthId,
                socketID,
                userName,
                roomId,
                ...ownerData.current,
              },
              () => {}
            );
        }
      } else {
        if (
          userInfo.current &&
          userInfo.current[userName] &&
          userInfo.current[userName].isTalking
        ) {
          socket &&
            socket.emit(
              "set-user-is-not-speaking",
              {
                harthId,
                socketID,
                userName,
                roomId,
                ...ownerData.current,
              },
              () => {}
            );
        }
      }
    }, interval);
  };
  const stopDetectSpeaking = () => {
    if (detectSpeakingIntervalId.current !== null) {
      clearInterval(detectSpeakingIntervalId.current);
      detectSpeakingIntervalId.current = null;
    }
  };
  const getLocalVideoStream = async (
    constraints = {
      audio: false,
      video: {
        width: { ideal: 1280, max: 1280 },
        height: { ideal: 720, max: 720 },
        frameRate: { ideal: 20, max: 20 },
      },
    }
  ) => {
    return new Promise((resolve) => {
      async function run() {
        let lastUsedVideoDeviceID = localStorage.getItem(
          "lastUsedVideoDeviceID"
        );
        if (lastUsedVideoDeviceID) {
          constraints.video.deviceId = {
            exact: lastUsedVideoDeviceID,
          };
          try {
            let stream = await navigator.mediaDevices.getUserMedia(constraints);

            resolve(stream);
          } catch (error) {
            try {
              delete constraints.video.deviceId;
              let stream = await navigator.mediaDevices.getUserMedia(
                constraints
              );

              resolve(stream);
            } catch (error) {
              resolve(false);
            }
          }
        } else {
          try {
            let stream = await navigator.mediaDevices.getUserMedia(constraints);

            resolve(stream);
          } catch (error) {
            resolve(false);
          }
        }
      }
      run();
    });
  };
  const getLocalCaptureStream = async (
    constraints = {
      video: {
        cursor: "always",
        width: { ideal: 1920, max: 1920 },
        height: { ideal: 1080, max: 1080 },
        frameRate: { ideal: 60, max: 60 },
        logicalSurface: true,
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
        }
      }
      run();
    });
  };
  const createPeerConnection = (conf) => {
    return new Promise((resolve, reject) => {
      const peer = new window.Peer(undefined, {
        config: { ...conf },
        debug: 2,
      });

      peer.on("open", () => {
        resolve(peer);
      });

      peer.on("error", (error) => {
        reject(error);
      });
    });
  };
  const createPeerObjects = async () => {
    const [authPeer, videoPeer, ScreenPeer] = await Promise.all([
      createPeerConnection({
        iceServers: [...TurnServers],
        audioBitrate: 128,
      }),
      createPeerConnection({
        iceServers: [...TurnServers],
        videoBitrate: 256,
        sdpSemantics: "unified-plan",
        video: {
          codecs: [
            { name: "VP8", priority: 10, payloadType: 120 },
            { name: "H264", priority: 20, payloadType: 100 },
          ],
        },
      }),
      createPeerConnection({
        iceServers: [...TurnServers],
        videoBitrate: 256,
        sdpSemantics: "unified-plan",
        video: {
          codecs: [
            { name: "VP8", priority: 10, payloadType: 120 },
            { name: "H264", priority: 20, payloadType: 100 },
          ],
        },
      }),
    ]);
    let obj = {
      userName,
      userIcon,
      userID: user._id,
      socketID,
      roomId,
      harthId,
      peerId: authPeer._id,
      videoPeer: videoPeer._id,
      capturePeer: ScreenPeer._id,
    };

    audioSharePeer.current = authPeer;
    audioSharePeer.current.on("call", async (call) => {
      call.answer();

      call.on("stream", (incomingStream) => {
        let peer = PEERS.current.find((p) => {
          return p.peerId == call.peer;
        });
        createAudio(incomingStream, peer, call);
      });
      call.on("error", function (err) {});
    });
    audioSharePeer.current.on("error", function (err) {
      audioSharePeer.current.reconnect();
    });

    videoSharePeer.current = videoPeer;
    videoSharePeer.current.on("call", async (call) => {
      call.answer();

      call.on("stream", (incomingStream) => {
        let peer = PEERS.current.find((p) => p.videoPeer == call.peer);
        createVideo(incomingStream, peer, call);
      });
      call.on("error", function (err) {});
    });
    videoSharePeer.current.on("error", function (err) {
      videoSharePeer.current.reconnect();
    });

    ScreenSharePeer.current = ScreenPeer;
    ScreenSharePeer.current.on("call", async (call) => {
      call.answer();

      call.on("stream", (incomingStream) => {
        let peer = PEERS.current.find((p) => p.capturePeer == call.peer);
        createCapture(incomingStream, peer, call);
      });
      call.on("error", function (err) {});
    });
    ScreenSharePeer.current.on("error", function (err) {
      ScreenSharePeer.current.reconnect();
    });
    joinRoomSocket(obj);
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

      let eligiblePeers = peers.filter(
        (peer) => peer.peerId !== audioSharePeer.current.id
      );

      if (eligiblePeers.length > 0) {
        let callPromises = eligiblePeers.map((peer) => {
          let options = {
            metadata: {
              streamID: audioStream.id,
              peer,
              priority: "high",
              type: "audio",
            },
            sdpSemantics: "unified-plan",
            prioritize: ["audio", "video"],
          };

          return audioSharePeer.current.call(peer.peerId, audioStream, options);
        });

        await Promise.all(callPromises);
      }

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
      setIsFinishedInitialSetup(true);
    }
  };
  const connectAudioToUsers = async () => {
    let audioStream = await getLocalAudioStream();
    if (audioStream) {
      localAudioStream.current = audioStream;

      let eligiblePeers = PEERS.current.filter(
        (peer) => peer.peerId !== audioSharePeer.current.id
      );

      if (eligiblePeers.length > 0) {
        let callPromises = eligiblePeers.map((peer) => {
          let options = {
            metadata: {
              streamID: audioStream.id,
              peer,
              priority: "high",
              type: "audio",
            },
            sdpSemantics: "unified-plan",
            prioritize: ["audio", "video"],
          };

          return audioSharePeer.current.call(peer.peerId, audioStream, options);
        });

        await Promise.all(callPromises);
      }
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
      if (PEERS.current.length <= 1) {
        createVideo(videoStream, ownerData.current);
      } else {
        createLocalVideo(videoStream);
      }
      let eligiblePeers = PEERS.current.filter(
        (peer) => peer.videoPeer !== videoSharePeer.current.id
      );

      if (eligiblePeers.length > 0) {
        let callPromises = eligiblePeers.map((peer) => {
          let options = { metadata: { streamID: videoStream.id } };

          return videoSharePeer.current.call(
            peer.videoPeer,
            videoStream,
            options
          );
        });

        await Promise.all(callPromises);
      }

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

      let eligiblePeers = PEERS.current.filter(
        (peer) => peer.capturePeer !== ScreenSharePeer.current.id
      );

      if (eligiblePeers.length > 0) {
        let callPromises = eligiblePeers.map((peer) => {
          let options = { metadata: { streamID: captureStream.id } };

          return ScreenSharePeer.current.call(
            peer.capturePeer,
            captureStream,
            options
          );
        });

        await Promise.all(callPromises);
      }

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
    if (audioSharePeer.current) {
      for (let conns in audioSharePeer.current.connections) {
        audioSharePeer.current.connections[conns].forEach((conn) => {
          if (data.peerId === conns) {
            try {
              conn.peerConnection?.close();
              if (conn.close) conn.close();
            } catch (error) {
              console.error(error);
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
              console.error(error);
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
              console.error(error);
            }
          }
        });
      }
    }
  };
  const disconnectVideos = () => {
    let id = localVideoStream.current.id;
    for (let conns in videoSharePeer.current.connections) {
      videoSharePeer.current.connections[conns].forEach((conn) => {
        if (conn.metadata?.streamID == id) {
          if (conn.close) conn.close();
        }
      });
    }
    const tracks = localVideoStream.current.getTracks();
    tracks.forEach((track) => {
      track.stop();
    });
    removeElement(id);
    removeElement(ownerData.current?.videoPeer);
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
      deleteID: id,
      ...ownerData.current,
    };
    sendNewChatMessage(newMsg);
    triggerUpdate();
  };
  const disconnectAudios = () => {
    let id = localAudioStream.current.id;
    for (let conns in audioSharePeer.current.connections) {
      audioSharePeer.current.connections[conns].forEach((conn) => {
        if (conn.metadata?.streamID == id) {
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
      deleteID: id,
      ...ownerData.current,
    };
    sendNewChatMessage(newMsg);
    triggerUpdate();
  };
  const disconnectCaptures = () => {
    let id = localCaptureStream.current.id;
    for (let conns in ScreenSharePeer.current.connections) {
      ScreenSharePeer.current.connections[conns].forEach((conn) => {
        if (conn.metadata?.streamID == id) {
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
      deleteID: id,
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
      let parentContainer = document.getElementById("localContainer");
      if (!parentContainer) {
        parentContainer = document.createElement("section");
        parentContainer.id = "localContainer";
        parentContainer.className = ` ${
          showChatPannel ? styles.ownerVideoChatOpen : null
        } `;
        const roomContainer = document.getElementById("video-container");
        roomContainer.append(parentContainer);
      }
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
      parentContainer.classList.add(styles.videoActive);
    }
  };
  const createVideo = (incomingStream, peer, call) => {
    let existingVideoContainer = document.getElementById(peer?.videoPeer);
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
        var nameText = document.createTextNode(peer?.name);
        nameContainer.className = styles.peerName;
        nameContainer.appendChild(nameText);
        parentContainer.append(nameContainer);

        const roomContainer = document.getElementById("peerContainer");
        roomContainer.append(parentContainer);
      }

      const videoContainer = document.createElement("div");
      const video = document.createElement("video");
      videoContainer.id = peer?.videoPeer;
      video.srcObject = incomingStream;
      video.autoplay = true;
      video.muted = true;
      video.className = "video";
      video.playsInline = true;
      videoContainer.appendChild(video);
      parentContainer.appendChild(videoContainer);
      parentContainer.classList.add(styles.videoActive);
    }
  };
  const createAudio = (incomingStream, peer, call) => {
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
        roomContainer?.append(parentContainer);
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
      if (socketID && peer) {
        if (PEERS.current?.length <= 1 || socketID !== peer?.socketID) {
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
            roomContainer?.append(parentContainer);
          }
        }
      }
    });
  };
  const toggleChat = () => {
    if (showChatPannel) {
      const element = document.getElementById("chatContainer");
      element.classList.add(styles.rendering);
      element.classList.remove(styles.entered);

      setTimeout(() => {
        setShowChatPannel((prevState) => {
          let newvalue = !prevState;
          if (newvalue === true) {
            setUnreadMsg(false);
          }
          chatPannel.current = newvalue;
          return newvalue;
        });
      }, 400);
    } else {
      setShowChatPannel((prevState) => {
        let newvalue = !prevState;
        if (newvalue === true) {
          setUnreadMsg(false);
        }
        chatPannel.current = newvalue;
        return newvalue;
      });
    }
  };
  const chatSubmitHandler = async (msg) => {
    let message = {
      ...msg,
      roomId: roomId,
      code: 0,
      date: new Date(),
      creator_name: userName,
      userName: userName,
      creator_image: userIcon,
    };

    if (msg.attachments?.length) {
      let promises = [];
      msg.attachments.forEach((file, idx) => {
        setUploadingAttachments((prevAttchs) => [...prevAttchs, file.name]);
        promises.push(
          new Promise(async (res) => {
            let uniqueID = generateID();
            let extention = file.name.split(".").pop();
            let name = `${roomId}_${uniqueID}_full.${extention}`;
            let thumbnail = `${roomId}_${uniqueID}_thumbnail.${extention}`;

            let bucket = "room-attachments";
            const data = await getUploadURL(name, file.type, bucket);
            const { ok, uploadURL } = data;
            if (ok) {
              let reader = new FileReader();
              reader.addEventListener("loadend", async () => {
                let result = await putImageInBucket(
                  uploadURL,
                  reader,
                  file.type
                );
                let { status } = result;
                if (status == 200) {
                  await compressImage(name, thumbnail, bucket, file.type);
                  res({
                    name: thumbnail,
                    fileType: file.type,
                  });
                }
              });
              reader.readAsArrayBuffer(file);
            }
          })
        );
      });
      const outputs = await Promise.all(promises);
      message.attachments = outputs;
    }

    setUploadingAttachments([]);
    sendNewChatMessage(message);
  };
  const reset = () => {
    stopDetectSpeaking();
    if (localAudioStream.current) {
      localAudioStream.current.getTracks().forEach((track) => track.stop());
      disconnectAudios();
    }

    if (localVideoStream.current) {
      localVideoStream.current.getTracks().forEach((track) => track.stop());
      disconnectVideos();
    }

    if (localCaptureStream.current) {
      localCaptureStream.current.getTracks().forEach((track) => track.stop());
      setIsActiveScreenShare(false);
      disconnectCaptures();
    }

    setSocket(null);
    setSocketID(null);
    setChats([]);
    triggerUpdate(0);
    triggerMapUpdate(0);
    setUploadingAttachments([]);
    setSelectedHarth(null);
    setScreenShareActive(false);
    setShowChatPannel(false);
    setUnreadMsg(false);
    setActiveCallRoom({});
    setCallRooms([]);
    setUserName("");
    setUserIcon("");
    setRoomId("");
    setHarthId("");
    setIsActiveScreenShare(false);
    setTurnServers([]);
    setDiceAlerts([]);
    setUserID("");
    setIsFinishedInitialSetup(false);

    ownerData.current = {};
    PEERS.current = [];
    audioSharePeer.current = null;
    videoSharePeer.current = null;
    ScreenSharePeer.current = null;
    chatPannel.current = false;
    localAudioStream.current = null;
    localStreamSource.current = null;
    localStreamAnalyser.current = null;
    detectSpeakingIntervalId.current = null;
    localVideoStream.current = null;
    localCaptureStream.current = null;
    userInfo.current = null;
  };
  const leaveRoom = () => {
    reset();

    leaveGroupCall({ roomId, userName, socketID }, () => {
      if (isMobile) {
        closeActiveRoomFromMobile({ roomId, userName, socketID });
      } else {
        window.close();
      }
    });
  };
  const leaveGroupCall = (data) => {
    reset();
    return new Promise((res, rej) => {
      socket &&
        socket.emit("group-call-user-left", data, (response) => {
          if (response.ok) {
            res(true);
            try {
              if (isMobile) {
                closeActiveRoomFromMobile({ roomId, userName, socketID });
              } else {
                window.close();
                const URLS = envUrls;
                window.location.replace(URLS[process.env.NODE_ENV]);
              }
            } catch (error) {
              const URLS = envUrls;
              window.location.replace(URLS[process.env.NODE_ENV]);
            }
          }
        });
    });
  };
  const diceRollHandler = (data) => {
    let roll = { ...data, roomId, userName, userIcon };
    roll.id = generateID();
    socket &&
      socket.emit("user-dice-roll", roll, ({ chats }) => {
        setChats((prevChats) => [chats, ...(prevChats || [])]);
        setDiceAlerts((alerts) => [...alerts, roll]);
      });
  };
  const changeVideoDevice = async (device) => {
    if (device && device.deviceId) {
      localStorage.setItem("lastUsedVideoDeviceID", device.deviceId);
    }
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
      let id = localVideoStream.current.id;
      removeElement(id);
      removeElement(ownerData.current?.videoPeer);
      localVideoStream.current = newStream;
      if (PEERS.current.length <= 1) {
        createVideo(newStream, ownerData.current);
      } else {
        createLocalVideo(newStream);
      }
      newStream.getTracks().forEach((trk) => {
        if (trk.kind == "video") {
          videoTrack = trk;
        }
      });

      try {
        for (let conns in videoSharePeer.current.connections) {
          videoSharePeer.current.connections[conns].forEach((conn) => {
            for (const sender of conn.peerConnection.getSenders()) {
              if (sender && sender.track?.kind == "video") {
                sender.replaceTrack(videoTrack);
              }
            }
          });
        }
      } catch (error) {
        console.error(error);
      }
    }
  };
  const changeAudioDevice = async (device) => {
    if (device && device.deviceId) {
      localStorage.setItem("lastUsedAudioDeviceID", device.deviceId);
    }
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
            for (const sender of conn.peerConnection.getSenders()) {
              if (sender && sender.track?.kind == "audio") {
                sender.replaceTrack(audioTrack);
              }
            }
          });
        }
      } catch (error) {
        console.error(error);
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
              //   console.log(device, device?.getCapabilities());
            }
          } catch (error) {}
        });
      });
    } catch (error) {
      setNotHDCapable(true);
    }
  };
  const removeDiceALert = (id) => {
    setDiceAlerts((alerts) => alerts.filter((m) => m.id !== id));
  };
  const mapChangeHandler = () => {
    socket &&
      socket.emit("map-change", { roomId, userName, userIcon }, ({ chats }) => {
        setChats((prevChats) => [chats, ...(prevChats || [])]);
      });
  };
  setPeerContainers();

  return (
    <>
      <Script src="https://unpkg.com/peerjs@1.3.2/dist/peerjs.min.js" preload />
      {!isFinishedInitialSetup ? <SpinningLoader gatherRoom={true} /> : null}
      <main id="PartyWindow" className={styles.PartyWindow}>
        <button
          id="mobile_minimized_closer"
          onClick={leaveRoom}
          style={{ display: "none" }}
        />
        <GatherHeader
          gatheringName={activeCallRoom?.roomName}
          selectedHarthIcon={selectedHarth?.iconKey}
          toggleHDSwitch={toggleHDSwitch}
          leaveMethod={leaveRoom}
          minimizeHandler={minimizeHandler}
        />

        <section
          className={`${styles.ContentContainer} ${
            isMobile && styles.ContentContainerMobile
          }`}
          id="video-container"
        >
          <div className={styles.alertContainer}>
            {diceAlerts.map((roll) => (
              <>
                <DiceAlert
                  rollResult={roll?.number}
                  profileImage={roll?.userIcon}
                  dice={roll?.sides}
                  roll={roll}
                  removeDiceALert={removeDiceALert}
                />
              </>
            ))}
          </div>

          <section
            className={`
                        ${styles.peerContainer}
                        ${isActiveScreenShare && styles.peerContainerActive}
                        ${
                          showChatPannel && !isMobile
                            ? styles.peerContainerChatOpen
                            : null
                        } 
                        ${isMobile && styles.peerContainerMobile}
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
                            ${isMobile && styles.streamContainerMobile}
                            `}
          ></section>

          <section
            id="chatContainer"
            className={`
              ${styles.ChatPanelContainer}
              ${showChatPannel ? styles.ChatPanelContainerOpen : null}
              ${isMobile ? styles.ChatPanelContainerMobile : null}
            `}
          >
            <ChatMessagesGeneral messages={chats} userName={userName} />
            <ChatInputGeneral
              uploadingAttachments={uploadingAttachments}
              onSubmitHandler={chatSubmitHandler}
            />
          </section>

          <section
            id="localContainer"
            className={` ${showChatPannel ? styles.ownerVideoChatOpen : null} `}
          ></section>
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
            mapChangeHandler={mapChangeHandler}
            mapUpdate={mapUpdate}
            hasAudioStream={localAudioStream.current}
            hasVideoStream={localVideoStream.current}
            hasScreenShareStream={localCaptureStream.current}
          />
        </>
      </main>
    </>
  );
};

export default Party;
