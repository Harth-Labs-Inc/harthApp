import { createContext, useState, useContext, useEffect, useRef } from "react";
import io from "socket.io-client";
import { videoSocketUrls } from "../constants/urls";
import { getScheduledCallRooms, deleteScheduledRoom } from "../requests/rooms";
import { combineDateTime } from "../services/helper";
import { useComms } from "./comms";
import { useSocket } from "./socket";
import { useAuth } from "./auth";
const VideoContext = createContext({});

/* eslint-disable */
export const VideoProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [socketID, setSocketID] = useState(null);
  const [callRooms, setCallRooms] = useState([]);
  const [scheduledcallRooms, setScheduledcallRooms] = useState([]);
  const [reconnected, setReconnected] = useState(false);
  const [activeTimers, setActiveTimers] = useState([]);

  const { user } = useAuth();
  const { emitUpdate, mainAlertsRef } = useSocket();
  const { selectedCommRef } = useComms();

  const socketRef = useRef(null);

  const connectSocket = (user) => {
    if (!user) return;

    if (socketRef.current) {
      socketRef.current.io.reconnection(false);
      socketRef.current.disconnect();
    }

    const token = localStorage.getItem("token");
    let URLS = videoSocketUrls;
    const tempSocket = io.connect(URLS[process.env.NODE_ENV], {
      transports: ["websocket"],
      query: { token },
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    tempSocket.on("connect", () => {
      socketRef.current = tempSocket;
      setSocket(tempSocket);
      setSocketID(tempSocket.id);
      setReconnected((prev) => !prev);
      setupListeners(tempSocket, user);
    });

    return tempSocket;
  };

  const setupListeners = (socket, user) => {
    if (!socket || !user) return;
    socket.off("broadcast");
    socket.off("new Scheduled room");
    socket.off("refresh Scheduled rooms");

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
      setupScheduleRooms(room);
    });
    socket.on("refresh Scheduled rooms", (room) => {
      setupScheduleRooms(room);
    });

    return;
  };

  useEffect(() => {
    function handleVisibilityChange() {
      if (!document.hidden) {
        manageSocketConnection();
      }
    }

    function handleOnline() {
      manageSocketConnection();
    }

    const manageSocketConnection = () => {
      if (navigator && navigator.onLine && !document.hidden) {
        connectSocket(user);
      }
    };

    manageSocketConnection();

    window.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("online", handleOnline);

      if (socket) {
        socket.disconnect();
        setSocket(null);
        socketRef.current = null;
      }
    };
  }, [user]);

  const pushScheduledRoom = (data) => {
    if (socket) {
      socket.emit("new-scheduled-room", data);
    } else if (socketRef.current) {
      socketRef.current.emit("new-scheduled-room", data);
    }
  };
  const refreshScheduledCallRooms = (room) => {
    if (socket) {
      socket.emit("refresh-scheduled-rooms", room);
    } else if (socketRef.current) {
      socketRef.current.emit("refresh-scheduled-rooms", room);
    }
  };
  const getInitialCallRooms = (data) => {
    let options = {};
    if (data) {
      options = {
        filter: "harthId",
        harthId: data.harthid || data.harthId,
      };
    }
    setupScheduleRooms(data);

    if (socket) {
      socket.emit("get-initial-call-rooms", options);
    } else if (socketRef.current) {
      socketRef.current.emit("get-initial-call-rooms", options);
    }
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
  const setupScheduleRooms = async (data) => {
    activeTimers.forEach((timer) => clearTimeout(timer));
    const newTimers = [];

    let id = data.harthid || data.harthId || data.harthID || "";
    let result = await getScheduledCallRooms(id);
    let { ok, rms } = result;
    if (ok && rms) {
      let filteredRooms = [];

      rms.sort((a, b) => {
        let aa = new Date(combineDateTime(a.gatheringDate, a.gatheringTime));
        let bb = new Date(combineDateTime(b.gatheringDate, b.gatheringTime));
        return aa - bb;
      });

      rms.forEach((rm) => {
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
          let timerDuration = localDate.getTime() - new Date().getTime();
          let timerId = setTimeout(async () => {
            try {
              await deleteScheduledRoom(rm._id);
              createEmptyRoom({ ...rm, setInitalTimer: true }, () => {});
              getInitialCallRooms(rm);
            } catch (error) {
              console.error("An error occurred:", error);
            }
          }, timerDuration);
          newTimers.push(timerId);
          filteredRooms.push(rm);
        } else {
          deleteScheduledRoom(rm._id);
        }
      });

      setScheduledcallRooms([...filteredRooms]);
      setActiveTimers((prevTimers) => {
        prevTimers.forEach(clearTimeout);
        return [...newTimers];
      });
    }
  };
  const createEmptyRoom = (data, cb) => {
    if (socket) {
      socket.emit("create-call-room", data, cb);
    } else if (socketRef.current) {
      socketRef.current.emit("create-call-room", data, cb);
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
        setupScheduleRooms,
        refreshScheduledCallRooms,
        sendGatherNotification,
      }}
    >
      {children}
    </VideoContext.Provider>
  );
};

export const useVideo = () => useContext(VideoContext);
