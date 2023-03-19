import openSocket from "socket.io-client";
import { videoSocketUrls } from "../constants/urls";
import { getTurnServers } from "../util/TURN";

let socketInstance = null;
let peers = {};

class SocketCaptureConnection {
    videoContainer = {};
    message = [];
    settings;
    streaming = false;
    myPeer;
    socket;
    isSocketConnected = false;
    isPeersConnected = false;
    myID = "";

    constructor(settings) {
        this.settings = settings;
        this.myPeer = this.initializePeerConnection();
        this.socket = this.initializeSocketConnection();
        if (this.socket) this.isSocketConnected = true;
        if (this.myPeer) this.isPeersConnected = true;
        this.initializePeersEvents();
        this.initializeSocketEvents();
    }
    initializeSocketEvents = () => {
        this.socket.on("connect", () => {
            console.info("socket connected");
        });
        this.socket.on("capture-user-disconnected", (userID) => {
            peers[userID] && peers[userID].close();
            this.removeVideo(userID);
        });
        this.socket.on("disconnect", () => {
            console.log("socket disconnected --");
        });
        this.socket.on("error", (err) => {
            console.error("socket error --", err);
        });
        this.socket.on("new-broadcast-messsage", (data) => {
            this.message = data;
            this.settings.updateInstance("message", this.message);
        });
        this.socket.on("display-media", (data) => {
            if (data.value)
                this.checkAndAddClass(
                    this.getMyVideo(data.userID),
                    "displayMedia"
                );
            else
                this.checkAndAddClass(
                    this.getMyVideo(data.userID),
                    "userMedia"
                );
        });
        this.socket.on("capture-user-video-off", (data) => {
            this.changeMediaView(data.id, data.status);
        });
    };
    initializePeersEvents = () => {
        this.myPeer.on("open", async (id) => {
            const { userDetails } = this.settings;
            this.myID = id;
            const userData = {
                userID: id,
                ...userDetails,
            };
            this.socket.emit(
                "join-capture-room",
                userData,
                this.setInitialMessages
            );
            await this.setNavigatorToStream();
        });
        this.myPeer.on("error", (err) => {
            console.error("peer connection error", err);
            this.myPeer.reconnect();
        });
    };
    setInitialMessages = (data) => {
        this.message = data;
        this.settings.updateInstance("message", this.message);
    };
    setNavigatorToStream = async () => {
        const stream = await this.getVideoAudioStream();
        if (stream) {
            this.streaming = true;
            this.settings.updateInstance("streaming", true);
            this.createVideo({ id: this.myID, stream });
            this.setPeersListeners(stream);
            this.newUserConnection(stream);
        }
    };
    getVideoAudioStream = async (video = false, audio = true) => {
        let userAgent = navigator.userAgent;
        let browser;
        if (userAgent.match(/edg/i)) {
            browser = "edge";
        } else if (userAgent.match(/firefox|fxios/i)) {
            browser = "firefox";
        } else if (userAgent.match(/opr\//i)) {
            browser = "opera";
        } else if (userAgent.match(/chrome|chromium|crios/i)) {
            browser = "chrome";
        } else if (userAgent.match(/safari/i)) {
            browser = "safari";
        } else {
            browser = "chrome";
        }

        let quality = this.settings.params?.quality;
        if (quality) quality = parseInt(quality);

        if (browser === "chrome") {
            const myNavigator =
                navigator.mediaDevices.getUserMedia ||
                navigator.mediaDevices.webkitGetUserMedia ||
                navigator.mediaDevices.mozGetUserMedia ||
                navigator.mediaDevices.msGetUserMedia;
            return myNavigator({
                video: video
                    ? {
                          frameRate: quality ? quality : 12,
                          noiseSuppression: true,
                          width: { min: 200, ideal: 200, max: 200 },
                          height: { min: 200, ideal: 200, max: 200 },
                      }
                    : false,
                audio: audio,
            });
        }

        return new Promise((res) => {
            const myNavigator =
                navigator.getUserMedia ||
                navigator.webkitGetUserMedia ||
                navigator.mozGetUserMedia ||
                navigator.msGetUserMedia;

            myNavigator(
                {
                    video: video
                        ? {
                              frameRate: quality ? quality : 12,
                              noiseSuppression: true,
                          }
                        : false,
                    audio: audio,
                },
                (stream) => {
                    res(stream);
                },
                (err) => {
                    console.error(err, "it didnt work");
                    res({});
                }
            );
        });
    };
    setPeersListeners = (stream) => {
        this.myPeer.on("call", (call) => {
            call.answer(stream);
            call.on("stream", (userVideoStream) => {
                this.createVideo({
                    id: call.metadata.id,
                    stream: userVideoStream,
                });
            });
            call.on("close", () => {
                this.removeVideo(call.metadata.id);
            });
            call.on("error", () => {
                console.error("peer error ------");
                this.removeVideo(call.metadata.id);
            });
            peers[call.metadata.id] = call;
        });
    };
    newUserConnection = (stream) => {
        this.socket.on("new-capture-user-connect", (userData) => {
            this.connectToNewUser(userData, stream);
        });
    };
    connectToNewUser(userData, stream) {
        const { userID } = userData;
        const call = this.myPeer.call(userID, stream, {
            metadata: { id: this.myID, ...userData },
        });
        call.on("stream", (userVideoStream) => {
            this.createVideo({ id: userID, stream: userVideoStream, userData });
        });
        call.on("close", () => {
            this.removeVideo(userID);
        });
        call.on("error", () => {
            console.error("peer error ------");
            this.removeVideo(userID);
        });
        peers[userID] = call;
    }
    boradcastMessage = (message) => {
        this.message.push(message);
        this.settings.updateInstance("message", this.message);
        this.socket.emit("broadcast-message", message);
    };
    createVideo = (createObj) => {
        if (!this.videoContainer[createObj.id]) {
            this.videoContainer[createObj.id] = {
                ...createObj,
            };
            const roomContainer = document.getElementById("capture-container");
            const videoContainer = document.createElement("div");
            videoContainer.id = `parent-${createObj.id}`;
            videoContainer.classList.add("video-parent");
            const video = document.createElement("video");
            video.srcObject = this.videoContainer[createObj.id].stream;
            video.id = createObj.id;
            video.autoplay = true;
            if (this.myID === createObj.id) video.muted = true;
            videoContainer.appendChild(video);
            roomContainer.append(videoContainer);
        } else {
            let el = document.getElementById(createObj.id);
            if (el) {
                el.srcObject = createObj.stream;
            }
        }
    };
    reInitializeStream = (video, audio, type = "userMedia") => {
        const media = navigator.mediaDevices.getDisplayMedia();
        return new Promise((resolve) => {
            media.then((stream) => {
                const myVideo = this.getMyVideo();

                this.toggleVideoTrack({ audio, video });
                this.listenToEndStream(stream, { video, audio });
                this.socket.emit("display-media", true);

                this.checkAndAddClass(myVideo, type);
                this.createVideo({ id: this.myID, stream });
                this.replaceStream(stream);
                resolve(true);
            });
        });
    };
    removeVideo = (id) => {
        delete this.videoContainer[id];
        const video = document.getElementById(`parent-${id}`);
        if (video) video.remove();
    };
    destoryConnection = () => {
        const myMediaTracks =
            this.videoContainer[this.myID]?.stream.getTracks();
        myMediaTracks?.forEach((track) => {
            track.stop();
        });
        socketInstance?.socket.disconnect();
        this.myPeer.destroy();
    };
    getMyVideo = (id = this.myID) => {
        return document.getElementById(id);
    };
    listenToEndStream = (stream, status) => {
        const videoTrack = stream.getVideoTracks();
        if (videoTrack[0]) {
            videoTrack[0].onended = () => {
                this.socket.emit("display-media", false);
                this.reInitializeStream(
                    status.video,
                    status.audio,
                    "userMedia"
                );
                this.settings.updateInstance("displayStream", false);
                this.toggleVideoTrack(status);
            };
        }
    };
    toggleVideoTrack = (status) => {
        const myVideo = this.getMyVideo();
        if (myVideo && !status.video)
            myVideo.srcObject?.getVideoTracks().forEach((track) => {
                if (track.kind === "video") {
                    this.socket.emit("capture-user-video-off", {
                        id: this.myID,
                        status: true,
                    });
                    !status.video && track.stop();
                }
            });
        else if (myVideo) {
            this.socket.emit("capture-user-video-off", {
                id: this.myID,
                status: false,
            });
            this.reInitializeStream(status.video, status.audio);
        }
    };
    toggleAudioTrack = (status) => {
        const myVideo = this.getMyVideo();
        if (myVideo)
            myVideo.srcObject?.getAudioTracks().forEach((track) => {
                if (track.kind === "audio") track.enabled = status.audio;
                status.audio
                    ? this.reInitializeStream(status.video, status.audio)
                    : track.stop();
            });
    };
    initializePeerConnection = () => {
        return new window.Peer(undefined, {
            config: {
                iceServers: [
                    ...getTurnServers(),
                    {
                        url: "stun:stun.1und1.de:3478",
                    },
                ],
            },
        });
    };
    initializeSocketConnection = () => {
        const URLS = videoSocketUrls;
        return openSocket.connect(URLS[process.env.NODE_ENV], {
            transports: ["websocket"],
            secure: true,
            reconnection: true,
            rejectUnauthorized: false,
            reconnectionAttempts: 10,
        });
    };
    replaceStream = (mediaStream) => {
        Object.values(peers).map((peer) => {
            peer.peerConnection?.getSenders().map((sender) => {
                if (sender.track.kind == "audio") {
                    if (mediaStream.getAudioTracks().length > 0) {
                        sender.replaceTrack(mediaStream.getAudioTracks()[0]);
                    }
                }
                if (sender.track.kind == "video") {
                    if (mediaStream.getVideoTracks().length > 0) {
                        sender.replaceTrack(mediaStream.getVideoTracks()[0]);
                    }
                }
            });
        });
    };
    checkAndAddClass = (video, type = "userMedia") => {
        if (video?.classList?.length === 0 && type === "displayMedia")
            video.classList.add("display-media");
        else video.classList.remove("display-media");
    };
    changeMediaView = (userID, status) => {
        const userVideoDOM = document.getElementById(userID);
        if (status) {
            const clientPosition = userVideoDOM.getBoundingClientRect();
            const createdCanvas = document.createElement("SPAN");
            createdCanvas.className = userID;
            createdCanvas.style.position = "absolute";
            createdCanvas.style.left = `0px`;
            createdCanvas.style.top = `0px`;
            createdCanvas.style.width = "100%";
            createdCanvas.style.height = "100%";
            createdCanvas.style.backgroundColor = "grey";
            const user = peers[userID];
            if (user) {
                const userIcon = user?.metadata?.user_img;
                if (userIcon) {
                    //   createdCanvas.style.backgroundImage = url(userIcon);
                    //   createdCanvas.style.backgroundRepeat =  no-repeat, repeat;
                }
            }

            userVideoDOM.parentElement.appendChild(createdCanvas);
        } else {
            const canvasElement = document.getElementsByClassName(userID);
            if (canvasElement[0]) canvasElement[0].remove();
        }
    };
}

export function createSocketCaptureConnectionInstance(settings = {}) {
    return (socketInstance = new SocketCaptureConnection(settings));
}
