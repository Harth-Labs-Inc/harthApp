import { createContext, useState, useContext, useEffect } from "react";
import io from "socket.io-client";
import { videoSocketUrls } from "../constants/urls";
import { getScheduledCallRooms, deleteScheduledRoom } from "../requests/rooms";
import { combineDateTime } from "../services/helper";
import { useComms } from "./comms";
import { useSocket } from "./socket";
import { sendPushNotification } from "requests/subscriptions";
const VideoContext = createContext({});

/* eslint-disable */
export const VideoProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [socketID, setSocketID] = useState(null);
  const [callRooms, setCallRooms] = useState([]);
  const [scheduledcallRooms, setScheduledcallRooms] = useState([]);

  const { emitUpdate, mainAlertsRef } = useSocket();
  const { selectedCommRef } = useComms();

  useEffect(() => {
    let URLS = videoSocketUrls;

    setSocket(
      io.connect(URLS[process.env.NODE_ENV], {
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
            if (
              data.harthID &&
              selectedCommRef.current &&
              data.harthID == selectedCommRef.current._id
            ) {
              setCallRooms(groupCallRooms);
            }

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
  }, [socket, socketID]);

  const pushScheduledRoom = (data) => {
    socket && socket.emit("new-scheduled-room", data);
  };
  const refreshScheduledCallRooms = (room) => {
    socket && socket.emit("refresh-scheduled-rooms", room);
  };
  const getInitialCallRooms = (data) => {
    let options = {};
    if (data) {
      options = {
        filter: "harthId",
        harthId: data.harthid || data.harthId,
      };
    }
    getInitialScheduledCallRooms(data);
    socket && socket.emit("get-initial-call-rooms", options);
  };
  const addHours = (date, hours) => {
    date.setHours(date.getHours() + hours);

    return date;
  };
  const sendGatherNotification = (rm) => {
    let msg = { ...rm };
    msg.updateType = "gather alert";
    let id = rm.harthId || rm.harthID || rm.harthid;

    if (id) {
      emitUpdate(id, msg, () => {});
    }
  };
  const getInitialScheduledCallRooms = async (data) => {
    let id = data.harthid || data.harthId || data.harthID || "";
    let result = await getScheduledCallRooms(id);
    let { ok, rms } = result;
    if (ok && rms) {
      let filteredRooms = [];
      rms
        .sort((a, b) => {
          let aa = new Date(combineDateTime(a.gatheringDate, a.gatheringTime));
          let bb = new Date(combineDateTime(b.gatheringDate, b.gatheringTime));
          return aa - bb;
        })
        .forEach((rm) => {
          const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
          const userDateTime = new Date(rm.localTimeDate).toLocaleString(
            "en-US",
            {
              timeZone: userTimeZone,
            }
          );
          const localDate = new Date(userDateTime);
          let newDate = addHours(new Date(userDateTime), 1);
          if (new Date() < new Date(newDate)) {
            let timer = localDate.getTime() - new Date().getTime();
            setTimeout(() => {
              deleteScheduledRoom(rm._id);
              createEmptyRoom({ ...rm, setInitalTimer: true }, () => {
                getInitialCallRooms(rm);
              });
            }, timer);
            filteredRooms.push(rm);
          } else {
            deleteScheduledRoom(rm._id);
          }
        });
      setScheduledcallRooms([...filteredRooms]);
    }
  };
  const createEmptyRoom = (data, cb) => {
    socket && socket.emit("create-call-room", data, cb);

    let pushData = {
      message: `Room ${data.roomName} is now active!`,
      pushTitle: `Harth`,
      env: process.env.NODE_ENV,
      ignoreSelf: true,
      comm_id: selectedCommRef.current._id,
    };

    if (data.setInitalTimer) {
      delete pushData.ignoreSelf;
    }

    try {
      sendPushNotification(pushData);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <VideoContext.Provider
      value={{
        socket,
        socketID,
        callRooms,
        scheduledcallRooms,
        getInitialCallRooms,
        createEmptyRoom,
        pushScheduledRoom,
        getInitialScheduledCallRooms,
        refreshScheduledCallRooms,
        sendGatherNotification,
      }}
    >
      {children}
    </VideoContext.Provider>
  );
};

export const useVideo = () => useContext(VideoContext);
