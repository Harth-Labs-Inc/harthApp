import React, { useEffect, useState } from "react";
import { useAuth } from "../../../contexts/auth";
import { useComms } from "../../../contexts/comms";
import { useSocket } from "../../../contexts/socket";

const Stream = () => {
  const [roomID, setRoomId] = useState("");
  const [commId, setCommId] = useState("");
  const { rooms, selectedcomm, setRooms, setComm, comms } = useComms();
  const { user } = useAuth();
  const { emitUpdate, incomingRoom, incomingRoomUpdate } = useSocket();

  useEffect(() => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const RId = urlParams.get("room_id");
    const CId = urlParams.get("comm_id");
    if (RId) {
      setRoomId(RId);
    }
    if (CId) {
      setCommId(CId);
    }
  }, []);

  useEffect(() => {
    if (comms) {
      let tempCom = comms.find((com) => com._id === commId);
      if (tempCom) {
        setComm(tempCom);
      }
    }
  }, [comms]);

  useEffect(() => {
    if (roomID && rooms && commId) {
      let selected = (rooms[commId] || []).find((rm) => rm._id === roomID);
      console.log(selected);
    }
  }, [roomID, rooms, commId]);

  return <div>stream</div>;
};

export default Stream;
