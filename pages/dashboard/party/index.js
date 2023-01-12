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

let myPeer;
let ScreenSharePeer;
let groupStreams = {};
let groupCaptStreams = {};
let chatPannel = false;
let userInfo = {};

const Party = () => {
    const [isCaptureButtonActive, setisCaptureButtonActive] = useState(false);

    //chat
    const [unreadMsg, setUnreadMsg] = useState(false);
    const [chats, setChats] = useState([]);
    const [showChatPannel, setShowChatPannel] = useState(false);

    const [userName, setUserName] = useState("");
    const [userIcon, setUserIcon] = useState("");
    const [roomId, setRoomId] = useState("");
    const [harthId, setHarthId] = useState("");
    const [socket, setSocket] = useState(null);
    const [socketID, setSocketID] = useState(null);
    const [callRooms, setCallRooms] = useState([]);
    const [groupCallStreams, setGroupCallStreams] = useState({});
    const [groupCaptureStreams, setGroupCaptureStreams] = useState({});
    const [activeCallRoom, setActiveCallRoom] = useState({});
    const [roomChange, setRoomChange] = useState(0);

    const [localStream, setLocalStream] = useState();
    const [localStreamChange, setLocalStreamChange] = useState(0);

    const [isSharingVideo, setIsSharingVideo] = useState(false);
    const [isSharingCapture, setIsSharingCapture] = useState(false);

    const [captureStream, setCaptureStream] = useState();
    const [Peers, setPeers] = useState([]);
    const [muteOn, setMuteOn] = useState(true);
    const [videoOn, setVideoOn] = useState(false);

    const [selectedHarth, setSelectedHarth] = useState(null);

    // part state
    const [outsideDiceRoll, setOutsideDiceRoll] = useState({});

    const mainRef = useRef();
    const localVidRef = useRef();
    const captureVidRef = useRef();
    const groupCaptureVidRef = useRef([]);
    const groupStreamsRef = useRef([]);
    const chatInput = useRef();
    const peerContainerRef = useRef();

    const { width } = useSize();
    const { isMobile } = useMobile();
    const { comms } = useComms();

    // ---------- video grid sizing --------------
    useEffect(() => {
        const container = document.getElementById("peerContainer");
        resize(container);
    }, [width, roomChange, isSharingCapture, showChatPannel]);

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
        let urls = {
            development: "http://localhost:5000",
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
        if (localStream) {
            localStream.getTracks().forEach((track) => {
                if (track.kind === "video") {
                    let enabled = track.enabled;
                    setVideoOn(enabled);
                }
                if (track.kind === "audio") {
                    let enabled = track.enabled;
                    setMuteOn(enabled);
                }
            });
        }
    }, [localStreamChange]);

    useEffect(() => {
        if (harthId && comms && comms.length) {
            let harth = comms.find((harthObj) => harthObj._id == harthId);
            setSelectedHarth(harth);
        }
    }, [harthId, comms]);

    // ---------- mobile view --------------
    useEffect(() => {
        if (isMobile) {
            //own video
            const ownVideo = document.getElementsByClassName("OwnerVideo");
            console.log(ownVideo);
        }
    }, [isMobile]);

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
                console.log(data, "party-event updated");
                setOutsideDiceRoll({ ...data });
                setTimeout(() => {
                    setOutsideDiceRoll({});
                }, 3000);
            });

            socket.on("user-left", (data) => {
                console.log("user-left");
                if (myPeer) {
                    for (let conns in myPeer.connections) {
                        myPeer.connections[conns].forEach(
                            (conn, index, array) => {
                                if (data.peerId === conns) {
                                    conn.peerConnection.close();
                                    if (conn.close) conn.close();
                                }
                            }
                        );
                    }
                }
                removeVideo(data.peerId);
                delete groupStreams[data.peerId];
            });
            socket.on("screen-share-close", (data) => {
                let streams = { ...groupCaptureStreams };
                delete streams[data.id];
                groupCaptStreams = streams;
                setGroupCaptureStreams(streams);
                removeVideo(data.id);
                let remoteGroupCaptureVideo = groupCaptureVidRef;
                if (remoteGroupCaptureVideo) {
                    remoteGroupCaptureVideo = remoteGroupCaptureVideo.current;
                    if (remoteGroupCaptureVideo) {
                        remoteGroupCaptureVideo.srcObject = null;
                    }
                }
            });

            // chat
            socket.on("incoming-chat-message", (data) => {
                if (!chatPannel) {
                    setUnreadMsg(true);
                }
                setChats((prevChats) => [data, ...prevChats]);
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

                setIsSharingCapture(!!activeScreenShare);
                setIsSharingVideo(!!activeVideoStream);
            });
        }
    }, [socket]);

    // ----------- media --------------

    useEffect(() => {
        if (localStream) {
            createVideo({ id: "owner", stream: localStream });
        }
    }, [localStream]);

    useEffect(() => {
        if (captureStream) {
            createCaptureVideo({
                id: ScreenSharePeer?.id,
                stream: captureStream,
            });
            connectCaptureUsers(true);
        }
    }, [captureStream]);

    // ---------- dice roll --------------
    const diceRollHandler = (data) => {
        socket &&
            socket.emit(
                "user-dice-roll",
                { ...data, roomId, userName, userIcon },
                ({ chats }) => {
                    setChats(chats);
                }
            );
    };

    // ---------- video logic --------------
    const startVideo = () => {
        getLocalStream("video");
    };
    const stopVideoOnly = (stream) => {
        try {
            stream.getTracks().forEach((track) => {
                if (track.readyState == "live" && track.kind === "video") {
                    let enabled = track.enabled;
                    track.enabled = !enabled;

                    let newMsg = {};
                    if (!enabled === false) {
                        newMsg = {
                            value: `${userName} disconnected video`,
                            code: 6,
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
                            value: `${userName} enabled video`,
                            code: 5,
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
    const startCapture = () => {
        getScreenCapture();
    };
    const stopCapture = () => {
        let tracks = captureVidRef?.current.srcObject.getTracks();

        tracks.forEach((track) => track.stop());
        captureVidRef.current.srcObject = null;
    };
    const toggleVideo = () => {
        if (!localStream) {
            startVideo();
        } else {
            try {
                localStream.getTracks().forEach((track) => {
                    if (track.kind === "video") {
                        stopVideoOnly(localStream);
                    }
                });
            } catch (error) {}
        }
        setLocalStreamChange((prev) => (prev += 1));
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
    };
    const toggleCapture = () => {
        if (!captureStream || captureStream.active === false) {
            startCapture();
            setisCaptureButtonActive(true);
        } else {
            stopCapture(captureStream);
            setisCaptureButtonActive(false);
        }
    };
    const getLocalStream = async (startWith) => {
        let stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true,
        });

        if (startWith && startWith == "video") {
            try {
                stream.getTracks().forEach((track) => {
                    if (track.kind === "audio") {
                        track.enabled = false;
                    }
                });
            } catch (error) {}
        }
        if (startWith && startWith == "audio") {
            try {
                stream.getTracks().forEach((track) => {
                    if (track.kind === "video") {
                        track.enabled = false;
                    }
                });
            } catch (error) {}
        }
        setLocalStreamChange((prev) => (prev += 1));
        setLocalStream(stream);
    };
    const getScreenCapture = async () => {
        try {
            let capture = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    cursor: "always",
                },
                audio: false,
            });

            if (capture) {
                capture.getTracks().forEach((track) => {
                    if (track) {
                        track.onended = () => {
                            let newMsg = {
                                value: `${userName} disconnected screen share`,
                                code: 2,
                                roomId: roomId,
                                userName: userName,
                                date: new Date(),
                                creator_name: "Admin",
                                flames: [],
                                reactions: [],
                                attachments: [],
                            };
                            setisCaptureButtonActive(false);

                            sendNewChatMessage(newMsg);
                            onScreenShareClose();
                        };
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
                };

                sendNewChatMessage(newMsg);
                setCaptureStream(capture);
            }
        } catch (err) {
            setisCaptureButtonActive(false);
        }
    };
    const onScreenShareClose = () => {
        if (socket) {
            const remoteGroupCaptureVideo = groupCaptureVidRef.current;
            try {
                remoteGroupCaptureVideo.srcObject = null;
            } catch (error) {}

            socket.emit("screen-share-closed", {
                roomId,
                id: ScreenSharePeer.id,
            });
            removeVideo(ScreenSharePeer.id);
        }
    };
    const addVideoStream = (incomingStream, peerid, turns) => {
        setGroupCallStreams((prevStreams) => {
            return { ...prevStreams, [peerid]: incomingStream };
        });

        groupStreams = {
            ...groupStreams,
            [peerid]: incomingStream,
        };

        let showTurnIcon = false;

        if (turns && turns.length) {
            turns.forEach((peer) => {
                if (peer.peerId === peerid) {
                    showTurnIcon = true;
                }
            });
        }

        createVideo(
            { id: peerid, stream: incomingStream },
            showTurnIcon,
            turns
        );
    };
    const addCaptureStream = (incomingStream, peerid, owner) => {
        setGroupCaptureStreams((prevStreams) => {
            return { ...prevStreams, [peerid]: incomingStream };
        });

        groupCaptStreams = {
            ...groupCaptStreams,
            [peerid]: {
                stream: incomingStream,
                owner: owner ? ScreenSharePeer.id : undefined,
            },
        };
        createCaptureVideo({ id: peerid, stream: incomingStream });
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
            createScreenSharePeer(obj);
        });

        myPeer.on("error", function (err) {
            console.log(err);
            myPeer.reconnect();
        });

        myPeer.on("disconnect", function (client) {
            removeVideo(client?.id);
        });

        myPeer.on("connection", function (dataConnection) {
            console.log("connected to peer", dataConnection);
        });
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
                console.log("peer error ------");
                removeVideo(call.peer);
            });
        });
    };
    const joinGroupCall = (obj) => {
        userWantsToJoinGroupCall(obj);
    };
    const userWantsToJoinGroupCall = (data) => {
        socket &&
            socket.emit(
                "group-call-join-request",
                data,
                ({ peers, chats, turns }) => {
                    connectToUsers(peers, turns);
                    setChats(chats);
                }
            );
    };
    const connectToUsers = async (peers, turns) => {
        if (myPeer) {
            peers.forEach((peer) => {
                if (peer.peerId !== myPeer.id) {
                    const call = myPeer.call(peer.peerId, localStream);
                    call &&
                        call.on("stream", (incomingStream) => {
                            if (incomingStream) {
                                addVideoStream(
                                    incomingStream,
                                    peer.peerId,
                                    turns
                                );
                            }
                        });
                }
            });
        }
    };
    const connectCaptureUsers = async (isOwner) => {
        if (ScreenSharePeer) {
            Peers.forEach((peer) => {
                if (peer.capturePeer !== ScreenSharePeer.id) {
                    const call = ScreenSharePeer.call(
                        peer.capturePeer,
                        captureStream
                    );
                    call &&
                        call.on("stream", (incomingStream) => {
                            if (incomingStream) {
                                addCaptureStream(
                                    incomingStream,
                                    ScreenSharePeer.id,
                                    isOwner
                                );
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
    const toggleChat = () => {
        setShowChatPannel((prevState) => {
            let newvalue = !prevState;
            if (newvalue === true) {
                setUnreadMsg(false);
            }
            chatPannel = newvalue;
            return newvalue;
        });
    };
    const sendNewChatMessage = (message) => {
        socket &&
            socket.emit("send-chat-message", message, () => {
                setChats((prevChats) => [message, ...prevChats]);
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

    // --------------- screen share ----------
    const createScreenSharePeer = (peerobj) => {
        let pID = "";
        ScreenSharePeer = new window.Peer(undefined, {
            config: {
                iceServers: [
                    ...getTurnServers(),
                    {
                        url: "stun:stun.1und1.de:3478",
                    },
                ],
            },
        });

        ScreenSharePeer.on("open", (peerid) => {
            pID = peerid;
            peerobj.capturePeer = peerid;
            joinGroupCall(peerobj);
        });

        ScreenSharePeer.on("error", function (err) {
            console.log(err);
            ScreenSharePeer.reconnect();
        });

        ScreenSharePeer.on("connection", function (dataConnection) {
            console.log("connected to peer", dataConnection);
        });

        ScreenSharePeer.on("disconnect", function (client) {
            // this will give you id in text or whatever format you are using
            // console.log('screen share disconnect with id ' + client.id)
            // removeVideo(client.id)
        });

        ScreenSharePeer.on("call", async (call) => {
            call.answer();

            call.on("stream", (incomingStream) => {
                if (incomingStream) {
                    addCaptureStream(incomingStream, call.peer);
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

    // new video
    const createVideo = (createObj, showTurnIcon, turns) => {
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
                const image = document.createElement("img");
                const name = document.createElement("p");
                video.srcObject = createObj?.stream;
                video.id = createObj?.id;
                video.classList.add(`${styles.peerVideo}`);
                video.autoplay = true;
                if (createObj?.id === "owner") {
                    video.muted = true;
                    videoContainer.classList.add(`${styles.ownerVideo}`);
                }
                videoContainer.appendChild(video);
                videoContainer.appendChild(image);
                videoContainer.appendChild(name);
                roomContainer.append(videoContainer);
            }
        } else {
            let el = document.getElementById(createObj?.id);
            if (el) {
                el.srcObject = createObj?.stream;
            }
        }
    };
    const createCaptureVideo = (createObj) => {
        setRoomChange((prevState) => (prevState += 1));
        if (!createObj) {
            createObj = {};
        }
        let match = document.getElementById(createObj?.id);

        if (!match) {
            const roomContainer = document.getElementById(
                "stream-window-capture-container"
            );
            const videoContainer = document.createElement("div");
            if (videoContainer) {
                videoContainer.id = `parent-${createObj?.id}`;
                videoContainer.classList.add("video-parent");
                const video = document.createElement("video");
                video.srcObject = createObj?.stream;
                video.id = createObj?.id;
                video.autoplay = true;
                if (myPeer.id === createObj?.id) video.muted = true;
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

    // hd switch
    const toggleHDSwitch = () => {};

    return (
        <main className={styles.PartyWindow} ref={mainRef}>
            {Object.keys(outsideDiceRoll).length ? (
                <DiceAlert
                    rollResult={outsideDiceRoll?.number}
                    profileImage={outsideDiceRoll?.userIcon}
                    dice={outsideDiceRoll?.sides}
                />
            ) : null}
            <section className={styles.PartyWindowVideoContainer}>
                <GatherHeader
                    gatheringName={activeCallRoom?.roomName}
                    selectedHarthIcon={selectedHarth?.iconKey}
                    toggleHDSwitch={toggleHDSwitch}
                />
                <div className={styles.PartyMainContent}>
                    <section
                        ref={peerContainerRef}
                        id="peerContainer"
                        className={`${styles.peerContainer} ${
                            isSharingCapture ? styles.isScreenShare : ""
                        }`}
                    ></section>
                    <section
                        id="stream-window-chat"
                        className={showChatPannel ? "open" : "closed"}
                    >
                        <div className={styles.ChatPanelContainer}>
                            <ChatMessagesGeneral
                                messages={chats}
                                userName={userName}
                            />
                            <GeneralChatInput
                                onSubmitHandler={chatSubmitHandler}
                            />
                        </div>
                    </section>
                </div>
                <section id="stream-window-capture-container"></section>
                <GatherControlBar
                    onLeaveHandler={leaveRoom}
                    onToggleVideo={toggleVideo}
                    onToggleAudio={toggleAudio}
                    onToggleScreenShare={toggleCapture}
                    captureIsActice={isCaptureButtonActive}
                    onToggleChat={toggleChat}
                    unreadMsg={unreadMsg}
                    diceRollHandler={diceRollHandler}
                />
            </section>
        </main>
    );
};

export default Party;
