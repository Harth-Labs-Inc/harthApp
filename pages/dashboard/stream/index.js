import React, { useEffect, useState } from "react";
import { useAuth } from "../../../contexts/auth";
import { useComms } from "../../../contexts/comms";
import { useSocket } from "../../../contexts/socket";

const Stream = () => {
  const [activeRoom, setActiveRoom] = useState();
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

  useEffect(async (displayMediaOptions) => {
    const test = await navigator.mediaDevices.getDisplayMedia(
      displayMediaOptions
    );
    console.log(test.getTracks());

    // devices
    const devices = await navigator.mediaDevices.enumerateDevices();
    console.log(devices);

    // camera
    // try {
    //   const constraints = { video: true, audio: true };
    //   const stream = await navigator.mediaDevices.getUserMedia(constraints);
    //   const videoElement = document.querySelector("video#localVideo");
    //   videoElement.srcObject = stream;
    // } catch (error) {
    //   console.error("Error opening video camera.", error);
    // }

    // screen share
    // try {
    //   const stream = await navigator.mediaDevices.getDisplayMedia();
    //   const videoElement = document.querySelector("video#localVideo");
    //   videoElement.srcObject = stream;
    // } catch (error) {
    //   console.error("Error opening video camera.", error);
    // }
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
      setActiveRoom(selected);
    }
  }, [roomID, rooms, commId]);

  if (activeRoom)
    return (
      <main>
        <section id="side-nav">
          <div id="header">
            <p>{activeRoom.name}</p>
            <p>active 4 billllllllion minutes</p>
          </div>
          <ul>
            {activeRoom.active_users.map((usr) => (
              <div>
                <span>
                  <img src={usr.iconKey}></img>
                </span>
                <span>{usr.name}</span>
                <span></span>
              </div>
            ))}
          </ul>
          <div id="footer">
            <p>leave</p>
            <p>mute</p>
            <p>disable video</p>
            <p>stream</p>
          </div>
        </section>
        <section id="stream-window">
          <video id="localVideo" autoPlay playsInline />
        </section>
      </main>
    );

  return <p>connecting to room...</p>;
};

export default Stream;
