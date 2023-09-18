import { createContext, useState, useContext, useEffect, useRef } from "react";
import io from "socket.io-client";
import { videoSocketUrls } from "../constants/urls";
import { getScheduledCallRooms, deleteScheduledRoom } from "../requests/rooms";
import { combineDateTime } from "../services/helper";
import { useComms } from "./comms";
import { useSocket } from "./socket";
import { useAuth } from "./auth";
import { useCallback } from "react";
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

  // ------------------------ socket connection logic --------------------------------

  const INITIAL_RECONNECT_INTERVAL = 500;
  let currentReconnectInterval = INITIAL_RECONNECT_INTERVAL;
  const MAX_RECONNECT_INTERVAL = 2500;

  let isReconnecting = false;

  const connectSocket = useCallback(() => {
    if (document.hidden || !user || !navigator.onLine) return;
    isReconnecting = true;
    const token = localStorage.getItem("token");
    const URL = videoSocketUrls[process.env.NODE_ENV];

    disconnectSocket();

    const tempSocket = io.connect(URL, {
      transports: ["websocket"],
      query: { token },
      reconnection: false,
    });

    tempSocket.on("connect", () => {
      if (document.hidden) {
        tempSocket.close();
        return;
      }
      socketRef.current = tempSocket;
      setSocket(tempSocket);
      setSocketID(tempSocket.id);
      setReconnected((prev) => !prev);
      setupListeners(tempSocket, user);
      isReconnecting = false;
      currentReconnectInterval = INITIAL_RECONNECT_INTERVAL;
    });

    const handleErrorOrDisconnect = (message) => {
      isReconnecting = false;
      disconnectSocket();
      setTimeout(() => {
        tryReconnect();
      }, currentReconnectInterval);
      currentReconnectInterval = Math.min(
        currentReconnectInterval * 2,
        MAX_RECONNECT_INTERVAL
      );
    };

    tempSocket.on("connect_error", (error) => {
      handleErrorOrDisconnect("Connection error: " + error);
    });
    tempSocket.on("error", (err) => {
      handleErrorOrDisconnect("Socket encountered an error: " + err);
    });
    tempSocket.on("disconnect", (reason) => {
      handleErrorOrDisconnect("Socket disconnected due to: " + reason);
    });

    return tempSocket;
  }, [user]);
  const disconnectSocket = () => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
  };
  const tryReconnect = useCallback(() => {
    if (
      !isReconnecting &&
      !document.hidden &&
      user &&
      navigator.onLine &&
      !socketRef.current?.connected
    ) {
      connectSocket();
    }
  }, [connectSocket]);

  useEffect(() => {
    connectSocket();

    function handleChange() {
      tryReconnect();
    }

    window.addEventListener("visibilitychange", handleChange);
    window.addEventListener("online", handleChange);
    window.addEventListener("focus", handleChange);
    return () => {
      window.removeEventListener("visibilitychange", handleChange);
      window.removeEventListener("online", handleChange);
      window.addEventListener("focus", handleChange);
      disconnectSocket();
    };
  }, [connectSocket, tryReconnect]);

  // ------------------------ socket logic --------------------------------

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
