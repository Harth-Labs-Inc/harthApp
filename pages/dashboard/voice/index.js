import { useContext, useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import axios from "axios";

import { useComms } from "../../../contexts/comms";
import { MobileContext } from "contexts/mobile";
import GatherControlBar from "../../../components/Gathering/GatherControlBar/GatherControlBar";
import GatherHeader from "../../../components/Gathering/GatherHeader/GatherHeader";
import GeneralChatInput from "../../../components/ChatInput/ChatInputGeneral";
import ChatMessagesGeneral from "../../../components/ChatMessages/ChatMessagesGeneral";

import styles from "./Voice.module.scss";
import { envUrls, videoSocketUrls } from "../../../constants/urls";

/* eslint-disable */

const Stream = () => {
    const { isMobile } = useContext(MobileContext);

    const [socket, setSocket] = useState(null);
    const [socketID, setSocketID] = useState(null);
    const [chats, setChats] = useState([]);
    const [update, triggerUpdate] = useState(0);

    const [selectedHarth, setSelectedHarth] = useState(null);
    const [unreadMsg, setUnreadMsg] = useState(false);
    const [activeCallRoom, setActiveCallRoom] = useState({});
    const [callRooms, setCallRooms] = useState([]);
    const [userName, setUserName] = useState("");
    const [userIcon, setUserIcon] = useState("");
    const [roomId, setRoomId] = useState("");
    const [harthId, setHarthId] = useState("");
    const [isActiveScreenShare, setIsActiveScreenShare] = useState(false);
    const [TurnServers, setTurnServers] = useState([]);
    const [playingStreams, setPlayingStreams] = useState({});
    const [showChatPannel, setShowChatPannel] = useState(
        isMobile ? false : true
    );
    const [wakeLockActive, setWakeLockActive] = useState(false);

    const ownerData = useRef({});
    const PEERS = useRef([]);
    const audioSharePeer = useRef();
    const videoSharePeer = useRef();
    const ScreenSharePeer = useRef();
    const chatPannel = useRef(false);

    const localAudioStream = useRef();
    const localCaptureStream = useRef();
    const userInfo = useRef();
    const localStreamSource = useRef();
    const localStreamAnalyser = useRef();
    const detectSpeakingIntervalId = useRef(null);

    const { comms } = useComms();

    useEffect(() => {
        const { wakeLock } = navigator;
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

        // const handleVisibilityChange = () => {
        //     if (document.visibilityState === "visible") {
        //         if (wakeLock) {
        //             wakeLock
        //                 .request("screen")
        //                 .then(() => {
        //                     setWakeLockActive(true);
        //                 })
        //                 .catch((err) => {
        //                     setWakeLockActive(false);
        //                 });
        //         } else {
        //             setWakeLockActive(false);
        //         }
        //     } else {
        //         if (wakeLockActive) {
        //             wakeLock.release().then(() => {
        //                 setWakeLockActive(false);
        //             });
        //         }
        //     }
        // };

        // if (document.visibilityState === "visible") {
        //     if (wakeLock) {
        //         wakeLock
        //             .request("screen")
        //             .then(() => {
        //                 setWakeLockActive(true);
        //             })
        //             .catch(() => {
        //                 setWakeLockActive(false);
        //             });
        //     }
        // }

        // document.addEventListener("visibilitychange", handleVisibilityChange);
        // return () => {
        //     document.removeEventListener(
        //         "visibilitychange",
        //         handleVisibilityChange
        //     );

        //     if (wakeLockActive) {
        //         if (wakeLock) {
        //             wakeLock.release().then(() => {
        //                 setWakeLockActive(false);
        //             });
        //         }
        //     }
        // };
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
                        let msg = {
                            value: ``,
                            code: 101,
                            userName: userName,
                            roomId: roomId,
                            date: new Date(),
                            creator_name: "Admin",
                            flames: [],
                            reactions: [],
                            attachments: [],
                            ignoreInChat: true,
                            callerID: newMsg.socketID,
                            ...ownerData.current,
                        };
                        sendNewChatMessage(msg);
                    }
                }
                setChats((prevChats) => [newMsg, ...(prevChats || [])]);
            });
            socket.on("incoming-chat-message", (newMsg) => {
                if (
                    newMsg?.code == 1 &&
                    newMsg?.socketID !== ownerData.current?.socketID
                ) {
                    createPlayButton(newMsg);
                }
                if (newMsg?.code == 4) {
                    for (let conns in audioSharePeer.current.connections) {
                        audioSharePeer.current.connections[conns].forEach(
                            (conn) => {
                                if (
                                    conn.metadata?.streamID == newMsg.deleteID
                                ) {
                                    if (conn.close) conn.close();
                                }
                            }
                        );
                    }
                    removeElement(newMsg.peerId);
                }
                if (newMsg?.code == 2) {
                    removeElement(`${newMsg?.socketID}_play-button`);
                    removeElement(newMsg.capturePeer);
                    for (let conns in ScreenSharePeer.current.connections) {
                        ScreenSharePeer.current.connections[conns].forEach(
                            (conn) => {
                                if (
                                    conn.metadata?.streamID == newMsg.deleteID
                                ) {
                                    if (conn.close) conn.close();
                                }
                            }
                        );
                    }
                }
                if (
                    newMsg?.code == 100 &&
                    newMsg?.callerID == ownerData.current?.socketID
                ) {
                    if (localCaptureStream.current) {
                        ScreenSharePeer.current.call(
                            newMsg.capturePeer,
                            localCaptureStream.current
                        );
                    }
                }
                if (
                    newMsg?.code == 101 &&
                    newMsg?.callerID == ownerData.current?.socketID
                ) {
                    createPlayButton(newMsg);
                }
                if (
                    newMsg?.code == 102 &&
                    newMsg?.callerID == ownerData.current?.socketID
                ) {
                    for (let conns in ScreenSharePeer.current.connections) {
                        ScreenSharePeer.current.connections[conns].forEach(
                            (conn) => {
                                if (conn?.peer == newMsg.capturePeer) {
                                    if (conn.close) {
                                        conn.close();
                                    }
                                }
                            }
                        );
                    }
                }
                if (!chatPannel.current) {
                    setUnreadMsg(true);
                }
                if (!newMsg?.ignoreInChat) {
                    setChats((prevChats) => [newMsg, ...(prevChats || [])]);
                }
            });
            socket.on("userInfo-update", (info) => {
                if (info && ownerData.current) {
                    userInfo.current = info;
                    if (info.code == "isTalking") {
                        console.log("user change");
                        let userData = info[info?.userName];
                        if (userData.isTalking) {
                            let element = document.getElementById(
                                info?.socketID
                            );
                            if (!element) {
                                let myElement = document.getElementById(
                                    info?.peerId
                                );
                                if (myElement) {
                                    myElement.style.border =
                                        "1px solid #e46eb1";
                                }
                            } else {
                                element.style.border = "1px solid #e46eb1";
                            }
                        } else {
                            let element = document.getElementById(
                                info?.socketID
                            );
                            if (!element) {
                                let myElement = document.getElementById(
                                    info?.peerId
                                );
                                if (myElement) {
                                    myElement.style.border =
                                        "1px solid rgba(255, 255, 255, 0.1)";
                                }
                            } else {
                                element.style.border =
                                    "1px solid rgba(255, 255, 255, 0.1)";
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

    useEffect(() => {
        const element = document.getElementById("chatContainer");
        if (element) {
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
                        let stream = await navigator.mediaDevices.getUserMedia(
                            constraints
                        );

                        try {
                            const audioCtx = new AudioContext();
                            localStreamSource.current =
                                audioCtx.createMediaStreamSource(stream);
                            localStreamAnalyser.current =
                                audioCtx.createAnalyser();
                            localStreamAnalyser.current.fftSize = 2048;
                            localStreamSource.current.connect(
                                localStreamAnalyser.current
                            );

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
                            let stream =
                                await navigator.mediaDevices.getUserMedia(
                                    constraints
                                );

                            try {
                                const audioCtx = new AudioContext();
                                localStreamSource.current =
                                    audioCtx.createMediaStreamSource(stream);
                                localStreamAnalyser.current =
                                    audioCtx.createAnalyser();
                                localStreamAnalyser.current.fftSize = 2048;
                                localStreamSource.current.connect(
                                    localStreamAnalyser.current
                                );

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
                        let stream = await navigator.mediaDevices.getUserMedia(
                            constraints
                        );

                        try {
                            const audioCtx = new AudioContext();
                            localStreamSource.current =
                                audioCtx.createMediaStreamSource(stream);
                            localStreamAnalyser.current =
                                audioCtx.createAnalyser();
                            localStreamAnalyser.current.fftSize = 2048;
                            localStreamSource.current.connect(
                                localStreamAnalyser.current
                            );

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
        console.log("startDetectSpeaking");
        if (detectSpeakingIntervalId.current !== null) {
            console.log("detectSpeaking is already running");
            return;
        }

        const interval = 100;
        detectSpeakingIntervalId.current = setInterval(() => {
            const bufferLength = localStreamAnalyser.current.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            localStreamAnalyser.current.getByteFrequencyData(dataArray);
            const average =
                dataArray.reduce((acc, val) => acc + val) / bufferLength;

            if (average > 10) {
                if (
                    userInfo.current &&
                    userInfo.current[userName] &&
                    !userInfo.current[userName].isTalking
                ) {
                    console.log("talking");
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
                    console.log("not talking");

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

    const createAudioSharePeer = () => {
        let servers = [];
        if (TurnServers.length) {
            servers = TurnServers;
        } else {
            servers = [
                {
                    url: "stun:stun.1und1.de:3478",
                },
            ];
        }
        servers.length = 2;
        audioSharePeer.current = new window.Peer(undefined, {
            config: {
                iceServers: [...servers],
                audioBitrate: 128,
            },
            debug: 2,
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
            createScreenSharePeer(obj);
        });
        audioSharePeer.current.on("error", function () {
            try {
                audioSharePeer.current.reconnect();
            } catch (error) {
                console.error(error);
            }
        });
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
    };
    const createScreenSharePeer = (peerobj) => {
        let servers = [];
        if (TurnServers.length) {
            servers = TurnServers;
        } else {
            servers = [
                {
                    url: "stun:stun.1und1.de:3478",
                },
            ];
        }
        servers.length = 2;
        ScreenSharePeer.current = new window.Peer(undefined, {
            config: {
                iceServers: [...servers],
            },
            debug: 2,
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
                let peer = PEERS.current.find(
                    (p) => p.capturePeer == call.peer
                );
                createCapture(incomingStream, peer, call);
            });
            call.on("error", function (err) {});
        });
    };
    const joinRoomSocket = (obj) => {
        socket &&
            socket.emit("group-call-join-request", obj, ({ peers, chats }) => {
                PEERS.current = peers;
                ownerData.current = obj;
                triggerUpdate();
                setPeerContainers(obj);
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
                        metadata: {
                            streamID: audioStream.id,
                            peer,
                            priority: "high",
                            type: "audio",
                        },
                        sdpSemantics: "unified-plan",
                        prioritize: ["audio", "video"],
                    };

                    audioSharePeer.current.call(
                        peer.peerId,
                        audioStream,
                        options
                    );
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
                        metadata: {
                            streamID: audioStream.id,
                            peer,
                            priority: "high",
                            type: "audio",
                        },
                        sdpSemantics: "unified-plan",
                        prioritize: ["audio", "video"],
                    };

                    audioSharePeer.current.call(
                        peer.peerId,
                        audioStream,
                        options
                    );
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
    const cleanupIsTalkingAnalyser = () => {
        if (detectSpeakingIntervalId.current === null) {
            console.warn("detectSpeaking is not running");
            return;
        }

        clearInterval(detectSpeakingIntervalId.current);
        detectSpeakingIntervalId.current = null;
        localStreamAnalyser.current?.disconnect();
        localStreamSource.current?.disconnect();
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
        disconnectAudios();
    };
    const toggleAudio = async () => {
        if (localAudioStream.current) {
            cleanupIsTalkingAnalyser();
        } else {
            connectAudioToUsers();
        }
    };

    const sendNewChatMessage = (message) => {
        socket &&
            socket.emit("send-chat-message", message, () => {
                setChats((prevChats) => [message, ...(prevChats || [])]);
            });
    };
    const createAudio = (incomingStream, peer) => {
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
            audio.id = `${peer?.peerId}_audio`;
            // audio.className = "audio";
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
    const createCapture = (incomingStream, peer, isPaused) => {
        const parentContainer = document.getElementById("peerContainer");
        const videoContainer = document.createElement("div");
        const video = document.createElement("video");
        videoContainer.className = styles.videoContainer;
        videoContainer.id = peer?.capturePeer;
        video.srcObject = incomingStream;
        video.id = `${peer?.socketID}_${peer?.capturePeer}`;
        video.autoplay = true;
        video.muted = true;
        video.className = "video";
        video.playsInline = true;

        videoContainer.appendChild(video);
        parentContainer.appendChild(videoContainer);
        removeElement(`${peer?.socketID}_play-button`);
        createStopButton(peer);
        setPlayingStreams({
            ...playingStreams,
            [peer.socketID]: false,
        });
    };
    const createPlayButton = (peer) => {
        const parentContainer = document.getElementById(peer?.socketID);
        if (parentContainer) {
            const button = document.createElement("button");
            button.id = `${peer?.socketID}_play-button`;
            button.className = styles.playButton;
            button.textContent = "Play Stream";
            button.onclick = function () {
                let newMsg = {
                    value: ``,
                    code: 100,
                    userName: userName,
                    roomId: roomId,
                    date: new Date(),
                    creator_name: "Admin",
                    flames: [],
                    reactions: [],
                    attachments: [],
                    ignoreInChat: true,
                    callerID: peer?.socketID,
                    ...ownerData.current,
                };
                sendNewChatMessage(newMsg);
            };
            parentContainer.appendChild(button);
        }
    };
    const createStopButton = (peer) => {
        if (peer?.socketID !== ownerData.current?.socketID) {
            const parentContainer = document.getElementById(peer?.socketID);
            if (parentContainer) {
                const button = document.createElement("button");
                button.id = `${peer?.socketID}_play-button`;
                button.className = styles.playButton;
                button.textContent = "Stop Stream";
                button.onclick = function () {
                    for (let conns in ScreenSharePeer.current.connections) {
                        ScreenSharePeer.current.connections[conns].forEach(
                            (conn) => {
                                if (conn?.peer == peer.capturePeer) {
                                    if (conn.close) {
                                        let newMsg = {
                                            value: ``,
                                            code: 102,
                                            userName: userName,
                                            roomId: roomId,
                                            date: new Date(),
                                            creator_name: "Admin",
                                            flames: [],
                                            reactions: [],
                                            attachments: [],
                                            ignoreInChat: true,
                                            callerID: peer?.socketID,
                                            ...ownerData.current,
                                        };
                                        sendNewChatMessage(newMsg);
                                        removeElement(
                                            `${peer?.socketID}_play-button`
                                        );
                                        removeElement(peer?.capturePeer);
                                        createPlayButton(peer);
                                        conn.close();
                                    }
                                }
                            }
                        );
                    }
                };
                parentContainer.appendChild(button);
            }
        }
    };
    const removeElement = (id) => {
        let Container = document.getElementById(id);
        if (Container) {
            Container.remove();
        }
    };
    const setPeerContainers = (owner) => {
        console.log(owner, "v");
        PEERS.current?.forEach((peer) => {
            if (socketID && peer) {
                let parentContainer = document.getElementById(peer?.socketID);
                if (!parentContainer) {
                    parentContainer = document.createElement("div");
                    parentContainer.id = peer?.socketID;
                    parentContainer.className = styles.userContainer;

                    const topContainer = document.createElement("div");
                    topContainer.id = `${peer?.socketID}_TopContainer`;
                    topContainer.className = styles.topContainer;

                    const profileContainer = document.createElement("span");
                    profileContainer.className = styles.profileContainer;

                    const profileImage = document.createElement("img");
                    profileImage.src = peer?.img;
                    profileImage.className = styles.peerImage;
                    profileContainer.append(profileImage);

                    const nameContainer = document.createElement("p");
                    const nameText = document.createTextNode(peer?.name);
                    nameContainer.className = styles.peerName;
                    nameContainer.appendChild(nameText);
                    profileContainer.append(nameContainer);

                    topContainer.append(profileContainer);
                    parentContainer.append(topContainer);

                    const roomContainer =
                        document.getElementById("leftcontainer");
                    roomContainer.append(parentContainer);
                }
                createVolumeContainer(peer, owner);
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
                        let URLS = envUrls;

                        window.location.replace(URLS[process.env.NODE_ENV]);
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
                    audioSharePeer.current.connections[conns].forEach(
                        (conn) => {
                            for (const sender of conn.peerConnection.getSenders()) {
                                if (sender && sender.track?.kind == "audio") {
                                    sender.replaceTrack(audioTrack);
                                }
                            }
                        }
                    );
                }
            } catch (error) {
                console.error(error);
            }
        }
    };
    // const toggleHDSwitch = () => {
    //   try {
    //     navigator.mediaDevices.getUserMedia({ audio: false, video: true });

    //     navigator.mediaDevices.enumerateDevices().then((devices) => {
    //       devices.forEach((device) => {
    //         try {
    //           if (device.kind == "videoinput") {
    //             //   console.log(device, device?.getCapabilities());
    //           }
    //         } catch (error) {}
    //       });
    //     });
    //   } catch (error) {
    //     setNotHDCapable(true);
    //   }
    // };

    // volume controls for users
    const volumeSliderHandler = (e, peer) => {
        const { value } = e.target;
        if (userInfo.current[peer.name]) {
            userInfo.current[peer.name].volume = value;
            let elem = document.getElementById(`${peer?.peerId}_audio`);
            if (elem) {
                elem.volume = value / 100;
            }
            triggerUpdate();
        }
    };
    // const createUnMuteButton = (peer) => {
    //     removeElement(`${peer?.socketID}_mute-button`);
    //     const parentContainer = document.getElementById(
    //         `${peer?.socketID}_slider-container`
    //     );
    //     if (parentContainer) {
    //         const button = document.createElement("button");
    //         button.id = `${peer?.socketID}_mute-button`;
    //         button.className = styles.unMuteButton;
    //         button.setAttribute("aria-label", `unmute ${peer?.name}`);
    //         button.setAttribute("data-title", `unmute ${peer?.name}`);
    //         button.onclick = function () {
    //             const audio = document.getElementById(`${peer?.peerId}_audio`);
    //             if (audio) {
    //                 audio.play();
    //                 // createMuteButton(peer);
    //             }
    //         };
    //         parentContainer.appendChild(button);
    //     }
    // };
    // const createMuteButton = (peer) => {
    //     removeElement(`${peer?.socketID}_mute-button`);
    //     const parentContainer = document.getElementById(
    //         `${peer?.socketID}_slider-container`
    //     );
    //     if (parentContainer) {
    //         const button = document.createElement("button");
    //         button.id = `${peer?.socketID}_mute-button`;
    //         button.className = styles.muteButton;
    //         button.setAttribute("aria-label", `mute ${peer?.name}`);
    //         button.setAttribute("data-title", `mute ${peer?.name}`);
    //         button.onclick = function () {
    //             const audio = document.getElementById(`${peer?.peerId}_audio`);
    //             if (audio) {
    //                 audio.pause();
    //                 // createUnMuteButton(peer);
    //             }
    //         };
    //         parentContainer.appendChild(button);
    //     }
    // };
    const createVolumeSlider = (peer) => {
        const parentContainer = document.getElementById(peer?.socketID);
        if (parentContainer) {
            const sliderContainer = document.createElement("div");
            sliderContainer.id = `${peer?.socketID}_slider-container`;
            sliderContainer.className = styles.sliderContainer;
            sliderContainer.style.visibility = "visible";
            const input = document.createElement("input");
            input.type = "range";
            input.id = `${peer?.socketID}_slider`;
            input.min = 0;
            input.max = 100;
            input.onchange = function (e) {
                volumeSliderHandler(e, peer);
            };
            sliderContainer.appendChild(input);
            parentContainer.appendChild(sliderContainer);
            // createMuteButton(peer);
        }
    };
    const createVolumeContainer = (peer, owner) => {
        if (
            peer.socketID &&
            owner.socketID &&
            peer.socketID !== owner.socketID
        ) {
            const parentContainer = document.getElementById(peer?.socketID);
            if (parentContainer) {
                let existingButton = document.getElementById(
                    `${peer?.socketID}_volume-button`
                );
                if (!existingButton) {
                    const container = document.getElementById(
                        `${peer?.socketID}_TopContainer`
                    );
                    const button = document.createElement("button");
                    button.id = `${peer?.socketID}_volume-button`;
                    button.className = styles.volumeButton;
                    button.setAttribute("aria-label", "volume");
                    button.onclick = function () {
                        let slider = document.getElementById(
                            `${peer?.socketID}_slider-container`
                        );
                        const volumeButton = document.getElementById(
                            `${peer?.socketID}_volume-button`
                        );
                        if (!slider) {
                            createVolumeSlider(peer);
                            volumeButton.classList.add(
                                styles.volumeButtonActive
                            );
                        } else {
                            let visibility = slider.style.visibility;
                            if (visibility == "visible") {
                                slider.style.display = "none";
                                slider.style.visibility = "hidden";
                                volumeButton.classList.remove(
                                    styles.volumeButtonActive
                                );
                            }
                            if (visibility == "hidden") {
                                slider.style.display = "block";
                                slider.style.visibility = "visible";
                                volumeButton.classList.add(
                                    styles.volumeButtonActive
                                );
                            }
                        }
                    };
                    container?.appendChild(button);
                    triggerUpdate();
                }
            }
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

    if (ownerData.current) {
        setPeerContainers(ownerData.current);
    }

    return (
        <>
            <main className={styles.VoiceWindow}>
                <GatherHeader
                    gatheringName={activeCallRoom?.roomName}
                    selectedHarthIcon={selectedHarth?.iconKey}
                    // toggleHDSwitch={toggleHDSwitch}
                    leaveMethod={leaveRoom}
                />

                <section
                    className={styles.ContentContainer}
                    id="video-container"
                >
                    <section
                        id="leftcontainer"
                        className={`${styles.leftContainer} ${
                            isMobile && styles.leftContainerMobile
                        }`}
                    ></section>

                    <section
                        id="chatContainer"
                        className={`${styles.ChatPanelContainer}
                        ${isMobile && styles.ChatPanelContainerMobile}
                        ${showChatPannel && styles.ChatPanelContainerOpen}`}
                    >
                        <ChatMessagesGeneral
                            messages={chats}
                            userName={userName}
                        />
                        <GeneralChatInput onSubmitHandler={chatSubmitHandler} />
                    </section>
                </section>
                <>
                    <GatherControlBar
                        onLeaveHandler={leaveRoom}
                        onToggleAudio={toggleAudio}
                        onToggleChat={isMobile && toggleChat}
                        unreadMsg={unreadMsg}
                        changeAudioDevice={changeAudioDevice}
                        roomId={roomId}
                        userInfo={(userInfo.current || {})[userName]}
                        roomType="voice"
                        hasAudioStream={localAudioStream.current}
                    />
                </>
            </main>
        </>
    );
};

export default Stream;
