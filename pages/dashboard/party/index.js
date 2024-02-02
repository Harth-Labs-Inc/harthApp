import { useContext, useEffect, useMemo, useRef, useState } from "react";
import io from "socket.io-client";
import axios from "axios";
import { generateID, getBaseUrl } from "../../../services/helper";
import { MobileContext } from "../../../contexts/mobile";

import GatherControlBar from "../../../components/Gathering/GatherControlBar/GatherControlBar";
import GatherHeader from "../../../components/Gathering/GatherHeader/GatherHeader";
import ChatInputGeneral from "../../../components/ChatInput/ChatInputGeneral";
import ChatMessagesGeneral from "../../../components/ChatMessages/ChatMessagesGeneral";
import { DiceAlert } from "../../../components/Gathering/GatherTools/DiceAlert";
import { IconChevronLeft } from "resources/icons/IconChevronLeft";
import { IconChevronRight } from "resources/icons/IconChevronRight";
import styles from "./Party.module.scss";
import { envUrls, videoSocketUrls } from "../../../constants/urls";
import { useAuth } from "contexts/auth";
import { getHarthByID } from "requests/community";
import { compressImage, getUploadURL, putImageInBucket } from "requests/s3";
import { SpinningLoader } from "../../../components/Common/SpinningLoader/SpinningLoader";
/* eslint-disable */

const Party = ({ closeActiveRoomFromMobile, minimizeHandler }) => {
  const [isPeerJsLoaded, setIsPeerJsLoaded] = useState(false);
  const [socket, setSocket] = useState(null);
  const [socketID, setSocketID] = useState(null);
  const [chats, setChats] = useState([]);
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
  const [currentPage, setCurrentPage] = useState(0);
  const [peers, setPeers] = useState([]);
  const [videoStreams, setVideoStreams] = useState({});

  const wakeLockRef = useRef(null);
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
  const { isMobile } = useContext(MobileContext);

  // -- wake lock / script loader --
  useEffect(() => {
    async function requestWakeLock() {
      if (navigator && "wakeLock" in navigator) {
        try {
          const wakeLock = await navigator.wakeLock.request("screen");
          wakeLockRef.current = wakeLock;
        } catch (err) {
          wakeLockRef.current = null;
          console.warn("Error acquiring wake lock:", err);
        }
      } else {
        wakeLockRef.current = null;
      }
    }
    async function releaseWakeLock() {
      try {
        await wakeLockRef.current?.release();
        wakeLockRef.current = null;
      } catch (err) {
        console.warn("Error releasing wake lock:", err);
      }
    }
    function handleVisibilityChange() {
      const hidden = document.hidden;
      if (!hidden) {
        requestWakeLock();
      } else {
        releaseWakeLock();
      }
    }
    requestWakeLock();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    if (typeof window !== "undefined" && !window.Peer) {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/peerjs@1.3.2/dist/peerjs.min.js";
      script.async = true;

      script.onload = () => {
        setIsPeerJsLoaded(true);
      };

      document.body.appendChild(script);
    } else if (window.Peer) {
      setIsPeerJsLoaded(true);
    }

    return () => {
      releaseWakeLock();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);
  // -- grab initial room data --
  const getHarth = async (id) => {
    try {
      const results = await getHarthByID(id);
      if (results.ok) {
        const creator = results.data?.users.find(
          (usr) => usr.userId === user._id
        );
        if (creator) {
          setHarthId(id);
          creator.iconKey && setUserIcon(creator.iconKey);
          creator.name && setUserName(creator.name);

          const URLS = videoSocketUrls;
          let connectionURL = "";
          let baseURL = getBaseUrl();
          console.log(baseURL, "baseURL");
          if (baseURL.includes("qa.hrth.app")) {
            connectionURL = URLS["qa"];
          } else {
            connectionURL = URLS[process.env.NODE_ENV] || URLS["development"];
          }
          try {
            const responseData = await axios.get(
              `${connectionURL}/api/get-turn-credentials`
            );
            const iceServers = responseData.data.token.iceServers;

            let filteredServers = [];
            let stunFound = false;
            let turnFound = false;

            for (const server of iceServers) {
              if (server.urls.startsWith("stun:") && !stunFound) {
                filteredServers.push(server);
                stunFound = true;
              } else if (server.urls.startsWith("turn:") && !turnFound) {
                filteredServers.push(server);
                turnFound = true;
              }

              if (stunFound && turnFound) {
                break;
              }
            }

            setTurnServers(filteredServers);
            const token = localStorage.getItem("token");
            setSocket(
              io.connect(connectionURL, {
                transports: ["websocket"],
                query: { token },
                reconnection: true,
                reconnectionAttempts: Infinity,
                reconnectionDelay: 300,
                reconnectionDelayMax: 2000,
              })
            );
          } catch (err) {
            console.warn(err);
          }
        }
      }
    } catch (error) {
      console.warn(error);
    }
  };
  useEffect(() => {
    if (!loading && user) {
      let ROOMID, HARTHID;

      function getParamsFromURL() {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        ROOMID = urlParams.get("room_id");
        HARTHID = urlParams.get("harth_id");
      }

      function getParamsFromSessionStorage() {
        const storedActiveRoom = sessionStorage.getItem("active_room");
        if (storedActiveRoom) {
          try {
            const parsedRoom = JSON.parse(storedActiveRoom);
            ROOMID = parsedRoom.room_id;
            HARTHID = parsedRoom.harth_id;
          } catch (error) {
            getParamsFromURL();
          }
        } else {
          getParamsFromURL();
        }
      }

      if (isMobile) {
        getParamsFromSessionStorage();
      } else {
        getParamsFromURL();
      }

      if (ROOMID) {
        setRoomId(ROOMID);
      }
      if (HARTHID) {
        getHarth(HARTHID);
      }
    }
  }, [loading, user, isMobile]);
  // -- set socket listeners --
  useEffect(() => {
    if (!socket) return;

    const handleConnection = () => setSocketID(socket.id);
    const handleBroadcast = (data) => processBroadcast(data);
    const handleChatUpdate = (newMsg) => processChatUpdate(newMsg);
    const handleIncomingChatMessage = (newMsg) =>
      processIncomingChatMessage(newMsg);
    const handlePartyEvent = (data) =>
      setDiceAlerts((alerts) => [...alerts, data]);
    const handleMapChange = () =>
      triggerMapUpdate((prevValue) => prevValue + 1);
    const handleUserInfoUpdate = (info) => processUserInfoUpdate(info);

    socket.on("connection", handleConnection);
    socket.on("broadcast", handleBroadcast);
    socket.on("chat-update", handleChatUpdate);
    socket.on("incoming-chat-message", handleIncomingChatMessage);
    socket.on("party-event", handlePartyEvent);
    socket.on("map-change", handleMapChange);
    socket.on("userInfo-update", handleUserInfoUpdate);

    return () => {
      socket.off("connection", handleConnection);
      socket.off("broadcast", handleBroadcast);
      socket.off("chat-update", handleChatUpdate);
      socket.off("incoming-chat-message", handleIncomingChatMessage);
      socket.off("party-event", handlePartyEvent);
      socket.off("map-change", handleMapChange);
      socket.off("userInfo-update", handleUserInfoUpdate);
    };
  }, [socket]);
  // -- start connecting --
  useEffect(() => {
    if (
      isPeerJsLoaded &&
      socketID &&
      !audioSharePeer.current &&
      userName &&
      roomId &&
      typeof window !== "undefined"
    ) {
      createPeerObjects();
    }
  }, [isPeerJsLoaded, socketID, userName, roomId]);
  // -- setting active call room --
  useEffect(() => {
    let tempactiveCallRoom = {};
    if (roomId) {
      tempactiveCallRoom = callRooms?.filter((room) => {
        return room.roomId === roomId;
      });
    }
    setActiveCallRoom(tempactiveCallRoom[0] || {});
  }, [callRooms]);
  // -- setting harth data --
  useEffect(() => {
    if (harthId && Comms && Comms.length) {
      let harth = Comms.find((harthObj) => harthObj._id == harthId);
      setSelectedHarth(harth);
    }
  }, [harthId, Comms]);
  // -- slide for chat --
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
  useEffect(() => {
    let localContainer = document?.getElementById("localContainer");
    if (isActiveScreenShare) {
      if (localContainer) {
        localContainer.style.visibility = "hidden";
      }
    } else {
      if (localContainer) {
        localContainer.style.visibility = "visible";
      }
    }
  }, [isActiveScreenShare]);

  const filterPeersForMobile = (peers) => {
    if (typeof window !== "undefined") {
      if (isActiveScreenShare) {
        return peers.sort((peer) => (isActiveUser(peer) ? -1 : 1));
      } else {
        let filteredPeers = [];
        if (peers.length == 1) {
          filteredPeers = peers;
        }
        if (peers.length > 1 && peers.length < 4) {
          filteredPeers = peers.filter((peer) => !isActiveUser(peer));
        }
        if (peers.length >= 4) {
          filteredPeers = peers.filter((peer) => !isActiveUser(peer));

          filteredPeers.push(peers.find(isActiveUser));
        }

        return filteredPeers;
      }
    }
    return [];
  };
  const filterPeersForDesktop = (peers) => {
    if (typeof window !== "undefined") {
      if (isActiveScreenShare) {
        return peers.sort((peer) => (isActiveUser(peer) ? -1 : 1));
      } else {
        let filteredPeers = [];
        if (peers.length == 1) {
          filteredPeers = peers;
        }
        if (peers.length > 1 && peers.length < 8) {
          filteredPeers = peers.filter((peer) => !isActiveUser(peer));
        }
        if (peers.length >= 8) {
          filteredPeers = peers.filter((peer) => !isActiveUser(peer));

          filteredPeers.push(peers.find(isActiveUser));
        }
        return filteredPeers;
      }
    }
    return [];
  };
  useEffect(() => {
    if (peers.length) {
      let test = false;
      let testnum = 10;
      let alteredPeerslist = peers || [];

      if (test) {
        alteredPeerslist = [...peers, ...generateMockPeers(testnum)];
      }

      const groupOrLocalVideo = checkForVideoOrLocal(peers);

      let preparedPeers = isMobile
        ? filterPeersForMobile(peers)
        : filterPeersForDesktop(peers);

      if (isMobile && preparedPeers.length >= 8) {
        preparedPeers = renderPeersForCurrentPage(preparedPeers);
      }

      preparedPeers.forEach((peer, index) => {
        let peerContainer = document.getElementById(peer.socketID);
        if (!peerContainer) {
          peerContainer = document.createElement("div");
          peerContainer.id = peer.socketID;
          peerContainer.className = styles.videoContainer;
          peerContainer.style.gridArea = `peer${index + 1}`;
          document.getElementById("peer-grid").appendChild(peerContainer);
        }

        let streamFound = false;

        for (let [key, data] of Object.entries(videoStreams)) {
          if (peer?.socketID == key) {
            streamFound = true;

            if (peer?.socketID == ownerData.current?.socketID) {
              if (!groupOrLocalVideo) {
                createLocalVideo(data?.stream);
              } else {
                createVideo(data?.stream, peer, index);
              }
            } else {
              createVideo(data?.stream, peer, index);
            }
          }
        }
        if (!streamFound) {
          createPlaceholderCard(peer, index);
        }
      });
    }
  }, [peers, videoStreams, isMobile, isActiveScreenShare, currentPage]);

  // -- socket listeners --
  const processBroadcast = (data) => {
    const { event, groupCallRooms, peers } = data;
    switch (event) {
      case "GROUP_CALL_ROOMS":
        setCallRooms(groupCallRooms);
        break;
      case "GROUP_CALL_PEERS":
        PEERS.current = peers;
        setPeers(peers);
        break;
      default:
        break;
    }
  };
  const processChatUpdate = (newMsg) => {
    if (newMsg?.code == 8) {
      removeElement(newMsg.capturePeer);
      remoteUserLeft(newMsg);
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
        sendNewChatMessage({
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
        });
        leaveRoom();
      }

      if (localVideoStream.current) {
        videoSharePeer.current.call(newMsg.videoPeer, localVideoStream.current);
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
  };
  const processUserInfoUpdate = (info) => {
    if (info && ownerData.current) {
      userInfo.current = info;

      if (info.code == "isTalking") {
        let userData = info[info?.userName];
        if (info?.userName === userName) {
          let micElement = document.getElementById("owner-mic");
          if (micElement) {
            micElement.style.fill = userData.isTalking ? "#3cc8a3" : "#88888e";
          }
        } else {
          let element =
            document.getElementById(info?.socketID) ||
            document.getElementById(info?.peerId);

          if (element) {
            element.style.border = userData.isTalking
              ? "1px solid #3cc8a3"
              : "1px solid rgba(255, 255, 255, 0.1)";
          }
        }
      } else {
        let screenShareActive = Object.values(info).some(
          (usr) => usr.screenShare === true
        );
        setIsActiveScreenShare(screenShareActive);
      }
    }
  };
  const processIncomingChatMessage = (newMsg) => {
    if (newMsg?.code == 1) {
      if (localCaptureStream.current) {
        disconnectCaptures();
      }
    }
    if (newMsg?.code == 2) {
      // user disconnected screen share
      for (let conns in ScreenSharePeer.current.connections) {
        ScreenSharePeer.current.connections[conns].forEach((conn) => {
          if (conn.metadata?.streamID == newMsg.deleteID) {
            if (conn.close) conn.close();
          }
        });
      }
      removeElement(newMsg.capturePeer);
    }
    if (newMsg?.code == 4) {
      // user disconnected audio
      if (audioSharePeer && audioSharePeer?.current) {
        for (let conns in audioSharePeer.current?.connections) {
          audioSharePeer.current?.connections[conns].forEach((conn) => {
            if (conn.metadata?.streamID == newMsg.deleteID) {
              if (conn.close) conn.close();
            }
          });
        }
      }
      removeElement(newMsg.peerId);
    }
    if (newMsg?.code == 6) {
      // user disconnected video
      if (videoSharePeer.current) {
        for (let conns in videoSharePeer.current.connections) {
          videoSharePeer.current.connections[conns].forEach((conn) => {
            if (conn.metadata?.streamID == newMsg.deleteID) {
              if (conn.close) conn.close();
            }
          });
        }
      }

      let parentContainer = document.getElementById(newMsg.socketID);
      if (parentContainer) {
        parentContainer.classList.remove(styles.videoActive);
      }
      removeVideoStreamById(newMsg.socketID);
      removeElement(newMsg.videoPeer);
    }
    if (!chatPannel.current) {
      setUnreadMsg(true);
    }
    setChats((prevChats) => [newMsg, ...(prevChats || [])]);
  };
  // -- peer builder --
  const reconnectPeer = (peer, conf) => {
    return new Promise(async (resolve, reject) => {
      try {
        if (peer.disconnected || !peer) {
          const reconnectedPeer = await createPeerConnection(conf);
          resolve(reconnectedPeer);
        } else {
          resolve(peer);
        }
      } catch (error) {
        reject(error);
      }
    });
  };
  const createPeerConnection = (conf) => {
    return new Promise((resolve, reject) => {
      if (!isPeerJsLoaded) {
        reject(new Error("PeerJS is not loaded"));
        return;
      }

      const peer = new window.Peer(undefined, {
        config: { ...conf },
        debug: 2,
      });

      peer.on("open", () => resolve(peer));
      peer.on("error", (error) => reject(error));
      peer.on("close", () => {
        console.warn("Peer disconnected. Reconnecting...");
        reconnectPeer(peer, conf)
          .then(() => {
            console.warn("Reconnected successfully.");
          })
          .catch((error) => {
            console.warn("Reconnection failed:", error);
          });
      });
    });
  };
  const handlePeerCall = (peer, peerType) => {
    peer.on("call", async (call) => {
      console.warn("Incoming call..");

      const handleStream = (incomingStream) => {
        if (peerType === "peerId") {
          createAudio(incomingStream, call, peer);
        } else if (peerType === "videoPeer") {
          let videoPeer = PEERS.current.find((p) => p.videoPeer == call.peer);
          attachVideoStream(videoPeer, incomingStream);
        } else if (peerType === "capturePeer") {
          let capturePeer = PEERS.current.find(
            (p) => p.capturePeer == call.peer
          );
          createCapture(incomingStream, capturePeer, call);
        }
      };

      const reconnectCall = async () => {
        let retryAttempts = 0;
        const initialRetryDelay = 1000;
        const maxRetryAttempts = 5;

        const attemptReconnect = async () => {
          try {
            call.answer();
            call.on("stream", handleStream);
            console.warn("Call reconnected successfully");
          } catch (error) {
            console.warn("Error reconnecting call:", error);
            if (retryAttempts < maxRetryAttempts) {
              setTimeout(
                attemptReconnect,
                initialRetryDelay * Math.pow(2, retryAttempts)
              );
              retryAttempts++;
            } else {
              console.warn(
                "Max retry attempts reached. Call cannot be reconnected."
              );
            }
          }
        };

        attemptReconnect();
      };

      call.answer();
      call.on("stream", handleStream);
      call.on("error", (error) => {
        console.warn("Call error:", error);
        reconnectCall();
      });
    });

    peer.on("error", () => peer.reconnect());
  };
  const createPeerObjects = async () => {
    if (!isPeerJsLoaded) {
      return;
    }

    const iceServerConfig = { iceServers: [...TurnServers] };
    const commonConfig = { ...iceServerConfig, sdpSemantics: "unified-plan" };
    const videoConfig = {
      ...commonConfig,
      videoBitrate: 256,
      video: {
        codecs: [
          { name: "VP8", priority: 10, payloadType: 120 },
          { name: "H264", priority: 20, payloadType: 100 },
        ],
      },
    };
    const screenConfig = {
      ...commonConfig,
      videoBitrate: 500,
      video: {
        codecs: [
          { name: "H264", priority: 10, payloadType: 100 },
          { name: "VP8", priority: 20, payloadType: 120 },
        ],
      },
    };

    try {
      const [authPeer, videoPeer, screenPeer] = await Promise.allSettled([
        createPeerConnection({ ...iceServerConfig, audioBitrate: 128 }),
        createPeerConnection(videoConfig),
        createPeerConnection(screenConfig),
      ]);

      if (authPeer.status === "fulfilled") {
        audioSharePeer.current = authPeer.value;
        handlePeerCall(audioSharePeer.current, "peerId");
      }

      if (videoPeer.status === "fulfilled") {
        videoSharePeer.current = videoPeer.value;
        handlePeerCall(videoSharePeer.current, "videoPeer");
      }

      if (screenPeer.status === "fulfilled") {
        ScreenSharePeer.current = screenPeer.value;
        handlePeerCall(ScreenSharePeer.current, "capturePeer");
      }

      const peerObject = {
        userName,
        userIcon,
        userID: user._id,
        socketID,
        roomId,
        harthId,
        peerId: authPeer.value._id,
        videoPeer: videoPeer.value._id,
        capturePeer: screenPeer.value._id,
      };

      joinRoomSocket(peerObject);
    } catch (error) {
      console.warn("Error creating peer objects:", error);
    }
  };
  // -- initial connection --
  const joinRoomSocket = (obj) => {
    if (!socket) {
      return;
    }
    socket.emit("join-room", obj, ({ peers, chats }) => {
      PEERS.current = peers;
      setPeers(peers);
      ownerData.current = obj;
      connectToUsers(peers);
      setChats(chats);
    });
  };
  const connectToUsers = async (peers) => {
    const audioStream = await getLocalAudioStream();

    if (audioStream) {
      localAudioStream.current = audioStream;

      const eligiblePeers = peers?.filter(
        (peer) => peer.peerId !== audioSharePeer.current.id
      );
      if (eligiblePeers && eligiblePeers.length > 0) {
        const callPromises = eligiblePeers.map((peer) => {
          const options = {
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

        await Promise.allSettled(callPromises);
      }

      const newMsg = {
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
      let element = document.getElementById("initialLoader");
      if (element) {
        element.remove();
      }
    }
  };
  // -- audio --
  const toggleAudio = async () => {
    if (localAudioStream.current) {
      disconnectAudios();
    } else {
      connectAudioToUsers();
    }
  };
  const disconnectAudios = () => {
    if (!localAudioStream.current) return;

    const audioStreamId = localAudioStream.current.id;

    for (const conns in audioSharePeer.current.connections) {
      audioSharePeer.current.connections[conns].forEach((conn) => {
        if (conn.metadata?.streamID === audioStreamId && conn.close) {
          conn.close();
        }
      });
    }

    localAudioStream.current.getTracks().forEach((track) => track.stop());
    localAudioStream.current = null;

    sendNewChatMessage({
      value: `${userName} disconnected audio`,
      code: 4,
      userName: userName,
      roomId: roomId,
      date: new Date(),
      creator_name: "Admin",
      flames: [],
      reactions: [],
      attachments: [],
      deleteID: audioStreamId,
      ...ownerData.current,
    });
  };
  const connectAudioToUsers = async () => {
    try {
      let audioStream = await getLocalAudioStream();
      if (!audioStream) {
        console.warn("No audio stream available");
        return;
      }

      localAudioStream.current = audioStream;

      const eligiblePeers = PEERS.current.filter(
        (peer) => peer.peerId !== audioSharePeer.current.id
      );

      if (eligiblePeers.length > 0) {
        const callPromises = eligiblePeers.map((peer) => {
          const options = {
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

        await Promise.allSettled(callPromises);
      }

      sendNewChatMessage({
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
      });
    } catch (error) {
      console.warn("Error in connectAudioToUsers:", error);
    }
  };
  const getLocalAudioStream = async () => {
    const defaultConstraints = {
      audio: true,
      video: false,
    };

    const desiredConstraints = {
      audio: { echoCancellation: true, noiseSuppression: true, codec: "opus" },
      video: false,
    };

    try {
      const lastUsedAudioDeviceID = localStorage.getItem(
        "lastUsedAudioDeviceID"
      );
      if (lastUsedAudioDeviceID) {
        desiredConstraints.audio.deviceId = { exact: lastUsedAudioDeviceID };
      }

      const stream =
        await navigator.mediaDevices.getUserMedia(desiredConstraints);
      setupAudioContext(stream);
      return stream;
    } catch (error) {
      console.warn("Error with desired constraints:", error);

      if (
        error.name === "OverconstrainedError" ||
        error.name === "NotAllowedError"
      ) {
        try {
          let fallbackStream =
            await navigator.mediaDevices.getUserMedia(defaultConstraints);
          setupAudioContext(fallbackStream);
          return fallbackStream;
        } catch (fallbackError) {
          console.warn("Error with fallback constraints:", fallbackError);
          return null;
        }
      } else {
        return null;
      }
    }
  };
  const setupAudioContext = (stream) => {
    const audioCtx = new AudioContext();
    localStreamSource.current = audioCtx.createMediaStreamSource(stream);
    localStreamAnalyser.current = audioCtx.createAnalyser();
    localStreamAnalyser.current.fftSize = 2048;
    localStreamSource.current.connect(localStreamAnalyser.current);
    startDetectSpeaking();
  };
  const startDetectSpeaking = () => {
    if (detectSpeakingIntervalId.current !== null) {
      clearInterval(detectSpeakingIntervalId.current);
      detectSpeakingIntervalId.current = null;
    }

    const interval = 250;
    detectSpeakingIntervalId.current = setInterval(() => {
      const bufferLength = localStreamAnalyser.current?.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      localStreamAnalyser.current?.getByteFrequencyData(dataArray);
      const average =
        dataArray.reduce((acc, val) => acc + val, 0) / bufferLength;

      const isTalking = average > 10;
      if (
        userInfo.current &&
        userInfo.current[userName] &&
        isTalking !== userInfo.current[userName].isTalking
      ) {
        const eventName = isTalking
          ? "set-user-speaking"
          : "set-user-not-speaking";
        socket &&
          socket.emit(
            eventName,
            { harthId, socketID, userName, roomId, ...ownerData.current },
            () => {}
          );
      }
    }, interval);
  };
  const stopDetectSpeaking = () => {
    if (detectSpeakingIntervalId.current !== null) {
      clearInterval(detectSpeakingIntervalId.current);
      detectSpeakingIntervalId.current = null;
    }
  };
  const createAudio = (incomingStream, call) => {
    let peer = PEERS.current.find((p) => {
      return p.peerId == call.peer;
    });
    let parentContainer = document.getElementById("audio-container");
    if (peer && parentContainer) {
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
  const changeAudioDevice = async (device) => {
    if (device?.deviceId) {
      localStorage.setItem("lastUsedAudioDeviceID", device.deviceId);

      if (localAudioStream.current) {
        localAudioStream.current.getTracks().forEach((track) => {
          if (track.kind === "audio") {
            track.stop();
          }
        });
      }

      try {
        const newStream = await getLocalAudioStream({
          audio: { deviceId: { exact: device.deviceId } },
          video: false,
        });

        const audioTrack = newStream
          .getTracks()
          .find((trk) => trk.kind === "audio");
        if (audioTrack && audioSharePeer.current) {
          Object.values(audioSharePeer.current.connections).forEach(
            (connections) => {
              connections.forEach((conn) => {
                conn.peerConnection.getSenders().forEach((sender) => {
                  if (sender && sender.track?.kind === "audio") {
                    sender.replaceTrack(audioTrack);
                  }
                });
              });
            }
          );
        }
      } catch (error) {
        console.warn("Error changing audio device:", error);
      }
    }
  };
  // -- video --
  const removeVideoStreamById = (peerId) => {
    setVideoStreams((prevStreams) => {
      const newStreams = { ...prevStreams };
      delete newStreams[peerId];
      return newStreams;
    });
  };
  const toggleVideo = async () => {
    if (localVideoStream.current) {
      disconnectVideos();
    } else {
      connectVideoToUsers();
    }
  };
  const disconnectVideos = () => {
    if (!localVideoStream.current) return;

    const videoStreamId = localVideoStream.current.id;

    for (const conns in videoSharePeer.current.connections) {
      videoSharePeer.current.connections[conns].forEach((conn) => {
        if (conn.metadata?.streamID === videoStreamId && conn.close) {
          conn.close();
        }
      });
    }

    localVideoStream.current.getTracks().forEach((track) => track.stop());
    localVideoStream.current = null;

    const parentContainerId = ownerData.current?.socketID;
    const parentContainer = document.getElementById(parentContainerId);
    if (parentContainer) {
      parentContainer.classList.remove(styles.videoActive);
    }
    removeVideoStreamById(ownerData.current?.socketID);
    removeElement(videoStreamId);
    removeElement(ownerData.current?.videoPeer);
    sendNewChatMessage({
      value: `${userName} disconnected video`,
      code: 6,
      userName: userName,
      roomId: roomId,
      date: new Date(),
      creator_name: "Admin",
      flames: [],
      reactions: [],
      attachments: [],
      deleteID: videoStreamId,
      ...ownerData.current,
    });
  };
  const checkForVideoOrLocal = (peers) => {
    if (isActiveScreenShare) {
      return 1;
    } else if (isMobile) {
      if (peers.length == 1) {
        return 1;
      }
      if (peers.length > 1 && peers.length < 4) {
        return 0;
      }
      if (peers.length >= 4) {
        return 1;
      }
      return 0;
    } else {
      if (peers.length == 1) {
        return 1;
      }
      if (peers.length > 1 && peers.length < 8) {
        return 0;
      }
      if (peers.length >= 8) {
        return 1;
      }
    }
    return 0;
  };
  const connectVideoToUsers = async () => {
    try {
      let videoStream = await getLocalVideoStream();
      if (!videoStream) {
        console.warn("No video stream available");
        return;
      }

      localVideoStream.current = videoStream;
      const groupOrLocalVideo = checkForVideoOrLocal(PEERS.current || []);
      if (!groupOrLocalVideo) {
        createLocalVideo(videoStream);
      }
      attachVideoStream(ownerData.current, videoStream);
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

        await Promise.allSettled(callPromises);
      }

      sendNewChatMessage({
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
      });
    } catch (error) {
      console.warn("Error in connectVideoToUsers:", error);
    }
  };
  const getLocalVideoStream = async () => {
    const defaultConstraints = {
      audio: false,
      video: true,
    };

    try {
      let constraints = { ...defaultConstraints };
      const lastUsedVideoDeviceID = localStorage.getItem(
        "lastUsedVideoDeviceID"
      );

      if (lastUsedVideoDeviceID) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDeviceExists = devices.some(
          (device) =>
            device.deviceId === lastUsedVideoDeviceID &&
            device.kind === "videoinput"
        );

        if (videoDeviceExists) {
          constraints.video = { deviceId: { exact: lastUsedVideoDeviceID } };
        } else {
          console.warn(
            "Previously used video device not found. Using default video settings."
          );
        }
      }

      return await navigator.mediaDevices.getUserMedia(constraints);
    } catch (error) {
      console.warn("Error in getLocalVideoStream:", error);

      if (error.name === "OverconstrainedError") {
        try {
          return await navigator.mediaDevices.getUserMedia(defaultConstraints);
        } catch (fallbackError) {
          console.warn("Error with fallback constraints:", fallbackError);
        }
      }

      return false;
    }
  };
  const createVideo = (incomingStream, peer) => {
    if (peer && peer.socketID && peer.videoPeer && incomingStream) {
      let existingVideo = document.getElementById(peer?.videoPeer);
      if (existingVideo) {
        return;
      }
      let parentContainer = document.getElementById(peer?.socketID);
      if (parentContainer) {
        const video = document.createElement("video");
        video.srcObject = incomingStream;
        video.autoplay = true;
        video.muted = true;
        video.className = "video";
        video.playsInline = true;
        video.id = peer?.videoPeer;
        parentContainer.appendChild(video);
        parentContainer.classList.add(styles.videoActive);
      }
    }
  };
  const createLocalVideo = (incomingStream) => {
    if (incomingStream && incomingStream.id) {
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
    }
  };
  const changeVideoDevice = async (device) => {
    if (device?.deviceId) {
      localStorage.setItem("lastUsedVideoDeviceID", device.deviceId);

      if (localVideoStream.current) {
        localVideoStream.current.getTracks().forEach((track) => {
          if (track.kind === "video") {
            track.stop();
          }
        });
      }

      try {
        const newStream = await getLocalVideoStream({
          video: { deviceId: { exact: device.deviceId } },
          audio: false,
        });

        let id = localVideoStream.current.id;
        removeVideoStreamById(ownerData.current?.socketID);
        removeElement(id);
        removeElement(ownerData.current?.videoPeer);
        localVideoStream.current = newStream;
        const groupOrLocalVideo = checkForVideoOrLocal(PEERS.current || []);
        if (groupOrLocalVideo) {
          attachVideoStream(ownerData.current, newStream);
        } else {
          createLocalVideo(newStream);
        }

        const videoTrack = newStream
          .getTracks()
          .find((trk) => trk.kind === "video");
        if (videoTrack && videoSharePeer.current) {
          Object.values(videoSharePeer.current.connections).forEach(
            (connections) => {
              connections.forEach((conn) => {
                conn.peerConnection.getSenders().forEach((sender) => {
                  if (sender && sender.track?.kind === "video") {
                    sender.replaceTrack(videoTrack);
                  }
                });
              });
            }
          );
        }
      } catch (error) {
        console.warn("Error changing video device:", error);
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
  const attachVideoStream = (peer, stream) => {
    setVideoStreams((prevStreams) => ({
      ...prevStreams,
      [peer.socketID]: { stream, peer },
    }));
  };
  // -- screen capture --
  const toggleCapture = async () => {
    if (localCaptureStream.current) {
      setScreenShareActive(false);
      disconnectCaptures();
    } else {
      setScreenShareActive(true);
      connectCaptureToUsers();
    }
  };
  const disconnectCaptures = () => {
    if (!localCaptureStream.current) return;

    const captureStreamId = localCaptureStream.current.id;

    for (const conns in ScreenSharePeer.current.connections) {
      ScreenSharePeer.current.connections[conns].forEach((conn) => {
        if (conn.metadata?.streamID === captureStreamId && conn.close) {
          conn.close();
        }
      });
    }

    localCaptureStream.current.getTracks().forEach((track) => track.stop());
    localCaptureStream.current = null;
    removeElement(ownerData.current?.capturePeer);

    sendNewChatMessage({
      value: `${userName} disconnected screen share`,
      code: 2,
      userName: userName,
      roomId: roomId,
      date: new Date(),
      creator_name: "Admin",
      flames: [],
      reactions: [],
      attachments: [],
      deleteID: captureStreamId,
      ...ownerData.current,
    });
  };
  const connectCaptureToUsers = async () => {
    try {
      let captureStream = await getLocalCaptureStream();
      if (!captureStream) {
        console.warn("No capture stream available");
        return;
      }

      localCaptureStream.current = captureStream;
      createCapture(captureStream, ownerData.current);

      const eligiblePeers = PEERS.current.filter(
        (peer) => peer.capturePeer !== ScreenSharePeer.current.id
      );

      if (eligiblePeers.length > 0) {
        const callPromises = eligiblePeers.map((peer) => {
          const options = { metadata: { streamID: captureStream.id } };
          return ScreenSharePeer.current.call(
            peer.capturePeer,
            captureStream,
            options
          );
        });

        await Promise.allSettled(callPromises);
      }

      sendNewChatMessage({
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
      });
    } catch (error) {
      console.warn("Error in connectCaptureToUsers:", error);
    }
  };
  const getLocalCaptureStream = async () => {
    const defaultConstraints = {
      video: true,
      audio: true,
    };

    const desiredConstraints = {
      video: {
        cursor: "always",
        width: { ideal: 1920, max: 1920 },
        height: { ideal: 1080, max: 1080 },
        logicalSurface: true,
      },
      audio: true,
    };

    try {
      let capture =
        await navigator.mediaDevices.getDisplayMedia(desiredConstraints);
      attachOnEndedHandler(capture);
      return capture;
    } catch (error) {
      console.warn("Error with desired constraints:", error);

      if (
        error.name === "OverconstrainedError" ||
        error.name === "NotAllowedError"
      ) {
        try {
          let fallbackCapture =
            await navigator.mediaDevices.getDisplayMedia(defaultConstraints);
          attachOnEndedHandler(fallbackCapture);
          return fallbackCapture;
        } catch (fallbackError) {
          console.warn("Error with fallback constraints:", fallbackError);
          return null;
        }
      } else {
        return null;
      }
    }
  };
  const attachOnEndedHandler = (captureStream) => {
    captureStream.getTracks().forEach((track) => {
      if (track.kind === "video") {
        track.onended = () => {
          disconnectCaptures();
        };
      }
    });
  };
  const createCapture = (incomingStream, peer) => {
    let existingVideoContainer = document.getElementById(peer?.capturePeer);
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
    video.controls = true;
    video.className = "video";
    video.playsInline = true;
    videoContainer.appendChild(video);
    parentContainer.appendChild(videoContainer);

    setScreenShareActive(true);
  };
  // -- chat --
  const sendNewChatMessage = (message) => {
    if (!socket) {
      return;
    }
    socket.emit("send-chat", message, () => {
      setChats((prevChats) => [message, ...(prevChats || [])]);
    });
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
  // -- map --
  const mapChangeHandler = () => {
    socket &&
      socket.emit("map-change", { roomId, userName, userIcon }, ({ chats }) => {
        setChats((prevChats) => [chats, ...(prevChats || [])]);
      });
  };
  // -- dice --
  const diceRollHandler = (data) => {
    if (!socket) {
      return;
    }

    let roll = { ...data, roomId, userName, userIcon };
    roll.id = generateID();
    socket.emit("dice-roll", roll, ({ chats }) => {
      setChats((prevChats) => [chats, ...(prevChats || [])]);
      setDiceAlerts((alerts) => [...alerts, roll]);
    });
  };
  const removeDiceALert = (id) => {
    setDiceAlerts((alerts) => alerts.filter((m) => m.id !== id));
  };
  // -- room helpers --
  const stopStreamTracks = (stream, callback) => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      if (callback) callback();
    }
  };
  const reset = () => {
    sessionStorage.removeItem("active_room");
    stopDetectSpeaking();
    stopStreamTracks(localAudioStream.current, disconnectAudios);
    stopStreamTracks(localVideoStream.current, disconnectVideos);
    stopStreamTracks(localCaptureStream.current, () => {
      setIsActiveScreenShare(false);
      disconnectCaptures();
    });

    setSocket(null);
    setSocketID(null);
    setChats([]);
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
    setVideoStreams({});
    setPeers([]);

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
  const handleWindowClose = () => {
    if (isMobile) {
      closeActiveRoomFromMobile({ roomId, userName, socketID });
    } else {
      window.close();
      const URLS = envUrls;
      window.location.replace(URLS[process.env.NODE_ENV]);
    }
  };
  const leaveRoom = async () => {
    reset();

    try {
      await leaveGroupCall({ roomId, userName, socketID });
      handleWindowClose();
    } catch (error) {
      console.warn("Error leaving group call:", error);
      handleWindowClose();
    }
  };
  const leaveGroupCall = (data) => {
    return new Promise((resolve, reject) => {
      if (!socket) {
        resolve(false);
      }

      socket.emit("user-left-room", data, (response) => {
        if (response && response.ok) {
          resolve();
        } else {
          resolve(false);
        }
      });
    });
  };
  const remoteUserLeft = (data) => {
    function closePeerConnections(peer, peerId) {
      if (!peer || !peer.connections) return;

      for (let conns in peer.connections) {
        if (peerId === conns) {
          peer.connections[conns].forEach((conn) => {
            tryCloseConnection(conn);
          });
        }
      }
    }

    function tryCloseConnection(conn) {
      try {
        conn.peerConnection?.close();
        if (conn.close) conn.close();
      } catch (error) {
        console.warn("Error closing connection:", error);
      }
    }
    closePeerConnections(audioSharePeer.current, data.peerId);
    closePeerConnections(videoSharePeer.current, data.videoPeer);
    closePeerConnections(ScreenSharePeer.current, data.capturePeer);
  };
  // -- gen ui --
  const removeElement = (id) => {
    let Container = document.getElementById(id);
    if (Container) {
      Container.remove();
    }
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
  const renderAlertContainer = () => (
    <div className={styles.alertContainer}>
      {diceAlerts.map((roll, index) => (
        <div key={index}>
          <DiceAlert
            rollResult={roll?.number}
            profileImage={roll?.userIcon}
            dice={roll?.sides}
            roll={roll}
            removeDiceALert={removeDiceALert}
          />
        </div>
      ))}
    </div>
  );
  const renderChatSection = () => (
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
  );
  // -- draw peer containers --
  const generateMockPeers = (numberOfPeers) => {
    const mockPeers = [];
    for (let i = 0; i < numberOfPeers; i++) {
      mockPeers.push({
        socketID: `peer${i + 1}`,
        userName: `User ${i + 1}`,
        userIcon: "",
      });
    }
    return mockPeers;
  };
  const createPlaceholderCard = (peer, index) => {
    if (peer && index >= 0) {
      let existingPlaceholderContainer = document.getElementById(
        `${peer?.socketID}_placeholder`
      );
      if (existingPlaceholderContainer) {
        return;
      }
      let parentContainer = document.getElementById(peer?.socketID);
      if (parentContainer) {
        const placeholderContainer = document.createElement("div");
        placeholderContainer.id = `${peer?.socketID}_placeholder`;
        const figure = document.createElement("figure");

        const img = document.createElement("img");
        img.src = peer.img || peer.userIcon;
        img.alt = peer.name || peer.userName;
        img.className = styles.peerImage;

        figure.appendChild(img);

        const peerName = document.createElement("p");
        peerName.className = styles.peerName;
        peerName.textContent = peer.name || peer.userName;

        placeholderContainer.appendChild(figure);
        placeholderContainer.appendChild(peerName);

        parentContainer.appendChild(placeholderContainer);
      }
    }
  };
  const renderPeersForCurrentPage = (peers) => {
    const startIndex = currentPage * 8;
    const endIndex = startIndex + 8;
    let peersForCurrentPage = peers.slice(startIndex, endIndex);

    if (!peersForCurrentPage.includes(ownerData.current)) {
      peersForCurrentPage.pop();
      peersForCurrentPage.push(ownerData.current);
    }

    return peersForCurrentPage;
  };
  const isActiveUser = (peer) => peer.socketID === ownerData.current?.socketID;

  const RenderPeerContainers = () => {
    const peersPerPage = 8;

    const mobileGridStylesMap = {
      1: {
        columns: "1fr",
        rows: "1fr",
        areas: ['"peer1"'],
      },
      2: {
        columns: "1fr",
        rows: "1fr 1fr",
        areas: ['"peer1"', '"peer2"'],
      },
      3: {
        columns: "1fr 1fr 1fr 1fr",
        rows: "1fr 1fr",
        areas: ['"peer1 peer1 peer2 peer2"', '"peer3 peer3 peer3 peer3"'],
      },
      4: {
        columns: "1fr 1fr",
        rows: "1fr 1fr",
        areas: ['"peer1 peer2"', '"peer3 peer4"'],
      },
      5: {
        columns: "1fr 1fr 1fr 1fr",
        rows: "1fr 1fr 1fr",
        areas: [
          '"peer1 peer1 peer2 peer2"',
          '"peer3 peer3 peer4 peer4"',
          '". peer5 peer5 ."',
        ],
      },
      6: {
        columns: "1fr 1fr",
        rows: "1fr 1fr 1fr",
        areas: ['"peer1 peer2"', '"peer3 peer4"', '"peer5 peer6"'],
      },
      7: {
        columns: "1fr 1fr 1fr 1fr",
        rows: "1fr 1fr 1fr 1fr",
        areas: [
          '"peer1 peer1 peer2 peer2"',
          '"peer3 peer3 peer4 peer4"',
          '"peer5 peer5 peer6 peer6"',
          '". peer7 peer7 ."',
        ],
      },
      8: {
        columns: "1fr 1fr",
        rows: "1fr 1fr 1fr 1fr",
        areas: [
          '"peer1 peer2"',
          '"peer3 peer4"',
          '"peer5 peer6"',
          '"peer7 peer8"',
        ],
      },
    };
    const desktopGridStylesMap = {
      1: {
        columns: "1fr",
        rows: "1fr",
        areas: ['"peer1"'],
      },
      2: {
        columns: "1fr 1fr",
        rows: "1fr",
        areas: ['"peer1 peer2"'],
      },
      3: {
        columns: "1fr 1fr 1fr 1fr",
        rows: "1fr 1fr",
        areas: ['"peer1 peer1 peer2 peer2"', '". peer3 peer3 ."'],
      },
      4: {
        columns: "1fr 1fr",
        rows: "1fr 1fr",
        areas: ['"peer1 peer2"', '"peer3 peer4"'],
      },
      5: {
        columns: "1fr 1fr 1fr 1fr 1fr 1fr",
        rows: "1fr 1fr",
        areas: [
          '"peer1 peer1 peer2 peer2 peer3 peer3"',
          '". peer4 peer4 peer5 peer5 ."',
        ],
      },
      6: {
        columns: "1fr 1fr  1fr",
        rows: "1fr 1fr",
        areas: ['"peer1 peer2 peer3"', '"peer4 peer5 peer6"'],
      },
      7: {
        columns: "1fr 1fr 1fr 1fr 1fr 1fr",
        rows: "1fr 1fr 1fr",
        areas: [
          '"peer1 peer1 peer2 peer2 peer3 peer3"',
          '"peer4 peer4 peer5 peer5 peer6 peer6"',
          '". . peer7 peer7 . ."',
        ],
      },
      8: {
        columns: "1fr 1fr 1fr 1fr",
        rows: "1fr 1fr",
        areas: ['"peer1 peer2 peer3 peer4"', '"peer5 peer6 peer7 peer8"'],
      },
      9: {
        columns: "1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr",
        rows: "1fr 1fr 1fr",
        areas: [
          '"peer1 peer1 peer2 peer2 peer3 peer3 peer4 peer4"',
          '"peer5 peer5 peer6 peer6 peer7 peer7 peer8 peer8"',
          '". . . peer9 peer9 . . ."',
        ],
      },
      10: {
        columns: "1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr",
        rows: "1fr 1fr 1fr",
        areas: [
          '"peer1 peer1 peer2 peer2 peer3 peer3 peer4 peer4"',
          '"peer5 peer5 peer6 peer6 peer7 peer7 peer8 peer8"',
          '". . peer9 peer9 peer10 peer10 . ."',
        ],
      },
      11: {
        columns: "1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr",
        rows: "1fr 1fr 1fr",
        areas: [
          '"peer1 peer1 peer2 peer2 peer3 peer3 peer4 peer4"',
          '"peer5 peer5 peer6 peer6 peer7 peer7 peer8 peer8"',
          '". peer9 peer9 peer10 peer10 peer11 peer11 ."',
        ],
      },
      12: {
        columns: "1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr",
        rows: "1fr 1fr 1fr",
        areas: [
          '"peer1 peer1 peer2 peer2 peer3 peer3 peer4 peer4"',
          '"peer5 peer5 peer6 peer6 peer7 peer7 peer8 peer8"',
          '"peer9 peer9 peer10 peer10 peer11 peer11 peer12 peer12"',
        ],
      },
      13: {
        columns: "1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr",
        rows: "1fr 1fr 1fr",
        areas: [
          '"peer1 peer1 peer2 peer2 peer3 peer3 peer4 peer4 peer5 peer5"',
          '"peer6 peer6 peer7 peer7 peer8 peer8 peer9 peer9 peer10 peer10"',
          '". . peer11 peer11 peer12 peer12 peer13 peer13 . ."',
        ],
      },
      14: {
        columns: "1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr",
        rows: "1fr 1fr 1fr",
        areas: [
          '"peer1 peer1 peer2 peer2 peer3 peer3 peer4 peer4 peer5 peer5"',
          '"peer6 peer6 peer7 peer7 peer8 peer8 peer9 peer9 peer10 peer10"',
          '". peer11 peer11 peer12 peer12 peer13 peer13 peer14 peer14 ."',
        ],
      },
      15: {
        columns: "1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr",
        rows: "1fr 1fr 1fr",
        areas: [
          '"peer1 peer1 peer2 peer2 peer3 peer3 peer4 peer4 peer5 peer5"',
          '"peer6 peer6 peer7 peer7 peer8 peer8 peer9 peer9 peer10 peer10"',
          '"peer11 peer11 peer12 peer12 peer13 peer13 peer14 peer14 peer15 peer15"',
        ],
      },
    };

    const preparePeersForMobile = (peers) => {
      if (typeof window !== "undefined") {
        if (isActiveScreenShare) {
          return peers.sort((peer) => (isActiveUser(peer) ? -1 : 1));
        } else {
          let parentContainer = document?.getElementById("localContainer");
          let filteredPeers = [];
          if (peers.length == 1) {
            filteredPeers = peers;
            if (parentContainer) {
              parentContainer.remove();
            }
          }
          if (peers.length > 1 && peers.length < 4) {
            filteredPeers = peers.filter((peer) => !isActiveUser(peer));
            if (localVideoStream.current) {
              createLocalVideo(localVideoStream.current);
            }
          }
          if (peers.length >= 4) {
            filteredPeers = peers.filter((peer) => !isActiveUser(peer));
            if (parentContainer) {
              parentContainer.remove();
            }
            filteredPeers.push(peers.find(isActiveUser));
          }

          return filteredPeers;
        }
      }
      return [];
    };
    const preparePeersForDesktop = (peers) => {
      if (typeof window !== "undefined") {
        if (isActiveScreenShare) {
          return peers.sort((peer) => (isActiveUser(peer) ? -1 : 1));
        } else {
          let parentContainer = document?.getElementById("localContainer");
          let filteredPeers = [];
          if (peers.length == 1) {
            filteredPeers = peers;
            if (parentContainer) {
              parentContainer.remove();
            }
          }
          if (peers.length > 1 && peers.length < 8) {
            filteredPeers = peers.filter((peer) => !isActiveUser(peer));
            if (localVideoStream.current) {
              createLocalVideo(localVideoStream.current);
            }
          }
          if (peers.length >= 8) {
            filteredPeers = peers.filter((peer) => !isActiveUser(peer));
            if (parentContainer) {
              parentContainer.remove();
            }
            filteredPeers.push(peers.find(isActiveUser));
          }
          return filteredPeers;
        }
      }
      return [];
    };

    const calculateGridStyle = (peerCount) => {
      let gridConfig = {};

      if (isMobile) {
        gridConfig = mobileGridStylesMap[peerCount];
      } else {
        gridConfig = desktopGridStylesMap[peerCount];
      }

      if (!gridConfig) {
        return;
      }
      return {
        display: "grid",
        gap: "1px",
        justifyContent: "center",
        alignItems: "center",
        gridTemplateColumns: gridConfig.columns,
        gridTemplateRows: gridConfig.rows,
        gridTemplateAreas: gridConfig.areas.join(" "),
      };
    };
    const calculateTotalPages = (peers) => {
      const numberOfPages = Math.ceil((peers.length - 1) / peersPerPage);
      return numberOfPages;
    };

    const renderPeers = () => {
      let test = false;
      let testnum = 10;
      let peers = PEERS.current || [];

      if (test) {
        peers = [...peers, ...generateMockPeers(testnum)];
      }

      let preparedPeers = isMobile
        ? preparePeersForMobile(peers)
        : preparePeersForDesktop(peers);

      const peerCount = preparedPeers.length;
      const totalPages = calculateTotalPages(preparedPeers);
      const peersToRender = preparedPeers;

      const goToNextPage = () => {
        setCurrentPage((prevPage) => (prevPage + 1) % totalPages);
      };
      const goToPreviousPage = () => {
        setCurrentPage((prevPage) => {
          return prevPage === 0 ? totalPages - 1 : prevPage - 1;
        });
      };

      if (isActiveScreenShare) {
        return (
          <div
            id="peer-grid"
            className={styles.flexedPeers}
            style={{ flexDirection: isMobile ? "row" : "column" }}
          />
        );
      }

      if (isMobile && peerCount > peersPerPage) {
        const renderedPeers = renderPeersForCurrentPage(peersToRender);
        const isLastPage = currentPage === totalPages - 1;
        return (
          <>
            <div
              id="peer-grid"
              style={{
                height: "100%",
                width: "100%",
                ...calculateGridStyle(renderedPeers.length),
              }}
            ></div>
            {totalPages > 1 && (
              <>
                <button
                  className={styles.peerswitcherNext}
                  onClick={goToNextPage}
                >
                  <IconChevronRight />
                </button>

                {isLastPage && (
                  <button
                    className={styles.peerswitcherPrev}
                    onClick={goToPreviousPage}
                  >
                    <IconChevronLeft />
                  </button>
                )}
              </>
            )}
          </>
        );
      }

      return (
        <div
          id="peer-grid"
          style={{
            height: "100%",
            width: "100%",
            ...calculateGridStyle(peerCount),
          }}
        ></div>
      );
    };

    return <>{renderPeers()}</>;
  };
  const memoizedPeerContainers = useMemo(() => {
    return <RenderPeerContainers />;
  }, [peers, currentPage, isActiveScreenShare]);

  const contentContainerClass = `${styles.ContentContainer} ${
    isMobile ? styles.ContentContainerMobile : ""
  }`;
  const peerContainerClass = `${styles.peerContainer} ${
    isActiveScreenShare ? styles.peerContainerActive : ""
  } ${showChatPannel && !isMobile ? styles.peerContainerChatOpen : ""} ${
    isMobile ? styles.peerContainerMobile : ""
  }`;
  const streamContainerClass = `${styles.streamContainer} ${
    isActiveScreenShare ? styles.streamContainerActive : ""
  } ${isMobile ? styles.streamContainerMobile : ""}`;

  return (
    <>
      <div id="initialLoader">
        <SpinningLoader gatherRoom={true} />
      </div>
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
          type="party"
        />

        <section className={contentContainerClass} id="video-container">
          {renderAlertContainer()}

          {isMobile ? (
            <>
              <section
                id="stream-window-container"
                className={streamContainerClass}
              ></section>
              <section
                className={peerContainerClass}
                id="peerContainer"
                style={{ height: isActiveScreenShare ? "max-content" : "100%" }}
              >
                {memoizedPeerContainers}
              </section>
            </>
          ) : (
            <>
              <section className={peerContainerClass} id="peerContainer">
                {memoizedPeerContainers}
              </section>
              <section
                id="stream-window-container"
                className={streamContainerClass}
              ></section>
            </>
          )}

          {renderChatSection()}

          <section
            id="localContainer"
            className={`${showChatPannel ? styles.ownerVideoChatOpen : ""}`}
          ></section>
        </section>

        <section
          id="audio-container"
          style={{ height: "0px", width: "0px", overflow: "hidden" }}
        ></section>

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
      </main>
    </>
  );
};

export default Party;
