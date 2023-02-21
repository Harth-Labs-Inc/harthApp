import { useEffect, useState, useContext } from "react";
import { useComms } from "../../../contexts/comms";
import { useVideo } from "../../../contexts/video";
import { useAuth } from "../../../contexts/auth";

import { Modal } from "../../../components/Common";
import { CloseBtn } from "../../../components/Common/Button";

import GatheringCard from "./GatheringCard/GatheringCard";
import GatheringSchedule from "../../../components/Gathering/GatheringSchedule/GatheringSchedule";
import GatherForm from "./GatherForm";
import GatherEditForm from "./GatherEditForm";
import GatherCreate from "./GatherCreate/GatherCreate";
import { CreateGatheringFormProvider as GatheringFormProvider } from "./GatherForm/GatheringFormContext";
import { CreateGatheringFormProvider as GatheringEditFormProvider } from "./GatherEditForm/GatheringFormContext";
import styles from "./GatheringDashboard.module.scss";
import GatheringCreate from "../../../components/Gathering/GatheringCreate/GatheringCreate";
import { GatheringTile } from "../../../components/Gathering/GatheringTile/GatheringTile";
import { GatherLoading } from "../../../components/Gathering/GatherLoading/GatherLoading";
import { MobileContext } from "../../../contexts/mobile";

const Video = (props) => {
  const [socketData, setSocketData] = useState({});
  const [newRoomToggled, setNewRoomToggled] = useState(false);
  const [newEditRoomToggled, setNewEditRoomToggled] = useState(false);
  const [newRoomData, setNewRoomData] = useState({
    gatheringType: "classic",
  });
  const [newEditRoomData, setEditRoomData] = useState();
  const { isMobile } = useContext(MobileContext);
  const { selectedcomm } = useComms();
  const {
    getInitialCallRooms,
    socketID,
    createEmptyRoom,
    callRooms,
    scheduledcallRooms,
  } = useVideo();
  const { user } = useAuth();

  console.log(socketID, "socketID");

  useEffect(() => {
    if (socketID) {
      let creator = selectedcomm.users.find((usr) => usr.userId === user._id);
      let data = {};
      data.icon = creator.iconKey;
      data.name = creator.name;
      data.harthid = selectedcomm._id;
      data.socketId = socketID;
      data.harthName = selectedcomm.name;
      setSocketData(data);
      getInitialCallRooms(data);
    }
  }, [socketID, selectedcomm]);

  const joinRoom = (data) => {
    let urls = {
      development: "http://localhost:3000/",
      production: "https://harth.vercel.app/",
    };
    window.open(
      `${urls[process.env.NODE_ENV]}?gather_window=true&room_type=${
        data.gatheringType
      }&user_name=${socketData.name}&user_img=${socketData.icon}&room_id=${
        data.roomId
      }&harth_id=${selectedcomm._id}`
    );
  };
  const createRoom = (room) => {
    createEmptyRoom({ ...socketData, ...room }, (data) => {
      joinRoom({ ...data.newGroupCallRoom, ...room });
    });
  };
  const triggerNewRoom = (room) => {
    if (room) {
      setNewRoomData(room);
    } else {
      setNewRoomData({ gatheringType: "stream" });
    }

    setNewRoomToggled((prevRoomToggle) => !prevRoomToggle);
  };
  const triggerNewEditRoom = (room) => {
    setEditRoomData(room);
    setNewEditRoomToggled((prevRoomToggle) => !prevRoomToggle);
  };
  const closeNewEditRoom = () => {
    setEditRoomData(null);
    setNewEditRoomToggled(false);
  };
  const createRoomFormSubmit = (room) => {
    if (room) {
      room.createdTime = new Date();
      createRoom(room);
    }
  };

  if (socketID) {
    let creator = selectedcomm?.users?.find((usr) => usr?.userId === user?._id);
    return (
      <section id="gatherings" className={styles.gatheringPage}>
        {newEditRoomToggled && (
          <GatheringSchedule
            type="edit"
            harthId={selectedcomm._id}
            harthName={selectedcomm.name}
            creator={selectedcomm.users.find((usr) => usr.userId === user._id)}
            closeHandler={closeNewEditRoom}
            room={newEditRoomData}
          />
        )}

        {newRoomToggled && (
          <GatheringSchedule
            harthId={selectedcomm._id}
            harthName={selectedcomm.name}
            creator={selectedcomm.users.find((usr) => usr.userId === user._id)}
            closeHandler={() => setNewRoomToggled(false)}
          />
        )}
        {/* <p className={styles.gatheringSection}>Now</p> */}
        <div className={styles.roomContainer}>
          <GatheringCreate
            createRoomFormSubmit={createRoomFormSubmit}
            createScheduleRoom={triggerNewRoom}
          />

          {(callRooms || []).map((room, idx) => {
            let owner = false;
            if (room?.hostName === creator?.name) {
              owner = true;
            }
            return (
              <>
              <div
                key={idx}
                className={`${room.gatheringType} ${isMobile && styles.roomHolderMobile}`}
              >
                <GatheringTile
                  room={room}
                  joinHandler={() => joinRoom(room)}
                  peers={room.peers}
                  acceptedPeers={room.acceptedPeers}
                  owner={owner}
                  user={creator}
                />
              </div>
              </>
            );
          })}
        </div>
        <p className={styles.gatheringSection}>UPCOMING</p>
        <div className={styles.roomContainer}>
          {(scheduledcallRooms || []).map((room, idx) => {
            let owner = false;
            if (room?.hostName === creator?.name) {
              owner = true;
            }
            return (
              <div key={idx} className={`${room.gatheringType} ${isMobile && styles.roomHolderMobile} room-container`}>
                <GatheringTile
                  cardType="schedule"
                  room={room}
                  user={creator}
                  peers={room.acceptedPeers}
                  owner={owner}
                  joinHandler={() => joinRoom(room)}
                  editScheduleRoom={triggerNewEditRoom}
                />
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  return (
    <section id="gatherings" className={styles.gatheringPage}>
      {newRoomToggled && (
        <GatheringSchedule
          harthId={selectedcomm._id}
          harthName={selectedcomm.name}
          creator={selectedcomm.users.find((usr) => usr.userId === user._id)}
          closeHandler={() => setNewRoomToggled(false)}
        />
      )}
      {/* <p className={styles.gatheringSection}>NOW</p> */}
      <div className={styles.roomContainer}>
        <GatheringCreate
          createRoomFormSubmit={createRoomFormSubmit}
          createScheduleRoom={triggerNewRoom}
        />
      </div>
      <p className={styles.gatheringSection}>UPCOMING</p>
      <div className={styles.roomContainer}>
        <GatherLoading />
        <GatherLoading />
        <GatherLoading />
        <GatherLoading />
        <GatherLoading />
        <GatherLoading />
      </div>
    </section>
  );
};

export default Video;
