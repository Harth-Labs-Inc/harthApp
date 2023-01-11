import { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import io from "socket.io-client";
import { setTurnServers } from "../util/TURN";
import { getScheduledCallRooms, deleteScheduledRoom } from "../requests/rooms";
import { combineDateTime } from "../services/helper";

const VideoContext = createContext({});

let myPeer;
export const VideoProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [socketID, setSocketID] = useState(null);
  const [callRooms, setCallRooms] = useState([]);
  const [scheduledcallRooms, setScheduledcallRooms] = useState([]);

  const [groupCallStreams, setGroupCallStreams] = useState({});
  const [localStream, setLocalStream] = useState();
  const [captureStream, setCaptureStream] = useState();
  const [myPeerId, setMyPeerId] = useState(null);

  useEffect(() => {
    let urls = {
      development: "http://localhost:5000",
      production: "https://project-blarg-video-socket.herokuapp.com",
    };
    axios
      .get(`http://localhost:5000/api/get-turn-credentials`)
      .then((responseData) => {
        setTurnServers(responseData.data.token.iceServers);

        setSocket(
          io.connect("http://localhost:5000", {
            transports: ["websocket"],
          })
        );
      })
      .catch((err) => {
        console.log(err);
      });
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
            let rooms = [...callRooms];
            rooms.forEach((room, index) => {
              if (peers[0] && room.roomId === peers[0].roomId) {
                rooms[index].peers = peers;
                setCallRooms(rooms);
              }
            });
            break;
          default:
            break;
        }
      });
      socket.on("new Scheduled room", (room) => {
        room.harthid = room.harthId;
        getInitialScheduledCallRooms(room);
      });
      socket.on("refresh Scheduled rooms", (room) => {
        getInitialScheduledCallRooms(room);
      });
    }
  }, [socket, socketID, localStream]);

  const pushScheduledRoom = (data) => {
    socket && socket.emit("new-scheduled-room", data);
  };
  const refreshScheduledCallRooms = (room) => {
    socket && socket.emit("refresh-scheduled-rooms", room);
  };
  const getInitialCallRooms = (data) => {
    let options = {};
    if (data) {
      options = { filter: "harthId", harthId: data.harthid || data.harthId };
    }
    getInitialScheduledCallRooms(data);
    socket && socket.emit("get-initial-call-rooms", options);
  };
  const getInitialScheduledCallRooms = async (data) => {
    let id = data.harthid ? data.harthid : data.harthId ? data.harthId : "";
    let result = await getScheduledCallRooms(id);
    let { ok, rms } = result;
    if (ok && rms) {
      setScheduledcallRooms([...rms]);
      rms.forEach((rm) => {
        let date = combineDateTime(rm.gatheringDate, rm.gatheringTime);
        let timer = date.getTime() - new Date().getTime();
        if (timer) {
          setTimeout(() => {
            deleteScheduledRoom(rm._id);
            createEmptyRoom({ ...rm }, () => {});
            getInitialCallRooms(rm);
          }, timer);
        }
      });
    }
  };
  const createEmptyRoom = (data, cb) => {
    socket && socket.emit("create-call-room", data, cb);
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
        setCaptureStream(capture);
      }
    } catch (err) {
      console.error("Error: " + err);
    }
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
      setMyPeerId(peerid);
      pID = peerid;
      joinGroupCall(peerid, data);
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
    });
  };

  const joinGroupCall = (peerid, data) => {
    let { roomId, userIcon, userName } = data;
    userWantsToJoinGroupCall({
      userName,
      userIcon,
      peerId: peerid,
      socketID,
      roomId,
      localStreamId: (localStream || {}).id || "",
    });
  };
  const userWantsToJoinGroupCall = (data) => {
    socket && socket.emit("group-call-join-request", data);
  };
  const connectToNewUser = async (data) => {
    if (myPeer) {
      const call = myPeer.call(data.peerId, localStream);
      call &&
        call.on("stream", (incomingStream) => {
          if (incomingStream) {
            addVideoStream(incomingStream, data.peerId);
          }
        });
    }
  };

  const addVideoStream = (incomingStream, peerid) => {
    let groupstreams = { ...groupCallStreams, [peerid]: incomingStream };
    setGroupCallStreams(groupstreams);
  };
  const leaveGroupCall = (data) => {
    return new Promise((res, rej) => {
      socket &&
        socket.emit("group-call-user-left", data, (response) => {
          if (response.ok) {
            res(true);
          }

          if (myPeer) {
            myPeer.destroy();
          }
        });
    });
  };

  return (
    <VideoContext.Provider
      value={{
        socket,
        localStream,
        socketID,
        callRooms,
        scheduledcallRooms,
        groupCallStreams,
        captureStream,
        getLocalStream,
        getInitialCallRooms,
        createEmptyRoom,
        getScreenCapture,
        leaveGroupCall,
        connectWithMyPeer,
        pushScheduledRoom,
        getInitialScheduledCallRooms,
        refreshScheduledCallRooms,
      }}
    >
      {children}
    </VideoContext.Provider>
  );
};

export const useVideo = () => useContext(VideoContext);
