import { useEffect, useState } from "react";
import { useComms } from "../../../contexts/comms";
import { useVideo } from "../../../contexts/video";
import { useAuth } from "../../../contexts/auth";

import { Modal } from "../../../components/Common";
import { CloseBtn } from "../../../components/Common/Button";

import GatheringCard from "./GatheringCard/GatheringCard";
import GatherForm from "./GatherForm";
import GatherEditForm from "./GatherEditForm";
import GatherCreate from "./GatherCreate/GatherCreate";
import { CreateGatheringFormProvider as GatheringFormProvider } from "./GatherForm/GatheringFormContext";
import { CreateGatheringFormProvider as GatheringEditFormProvider } from "./GatherEditForm/GatheringFormContext";
import styles from "./GatheringDashboard.module.scss";
import GatheringCreate from "../../../components/Gathering/GatheringCreate/GatheringCreate";
import { GatheringTile } from "../../../components/Gathering/GatheringTile/GatheringTile";
import { GatherLoading } from "../../../components/Gathering/GatherLoading/GatherLoading";

const Video = (props) => {
  const [socketData, setSocketData] = useState({});
  const [newRoomToggled, setNewRoomToggled] = useState(false);
  const [newEditRoomToggled, setNewEditRoomToggled] = useState(false);
  const [newRoomData, setNewRoomData] = useState({ gatheringType: "classic" });

  const [modal, setModal] = useState(false);

  const { selectedcomm } = useComms();
  const {
    getInitialCallRooms,
    socketID,
    createEmptyRoom,
    callRooms,
    scheduledcallRooms,
  } = useVideo();
  const { user } = useAuth();

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
  const triggerNewEditRoom = () => {
    setNewEditRoomToggled((prevRoomToggle) => !prevRoomToggle);
  };

  const showModal = () => {
    setModal(!modal);
  };

  const createRoomFormSubmit = (room) => {
    console.log(room);
    if (room) {
      room.createdTime = new Date();
      createRoom(room);
    }
  };

  if (socketID) {
    let creator = selectedcomm?.users?.find((usr) => usr?.userId === user?._id);
    return (
      <section id="gatherings">
        {newEditRoomToggled && (
          <Modal
            id="create_gathering"
            show={newEditRoomToggled}
            onToggleModal={() => {}}
          >
            <CloseBtn onClick={triggerNewEditRoom} />
            <GatherEditForm
              closeHandler={triggerNewEditRoom}
              createRoomFormSubmit={createRoomFormSubmit}
              harthId={selectedcomm._id}
              harthName={selectedcomm.name}
              creator={selectedcomm.users.find(
                (usr) => usr.userId === user._id
              )}
            />
          </Modal>
        )}

        {newRoomToggled && (
          <Modal id="create_gathering" show={modal} onToggleModal={showModal}>
            <CloseBtn onClick={triggerNewRoom} />
            <GatherForm
              createRoomFormSubmit={createRoomFormSubmit}
              harthId={selectedcomm._id}
              harthName={selectedcomm.name}
              creator={selectedcomm.users.find(
                (usr) => usr.userId === user._id
              )}
              newRoomData={newRoomData}
            />
          </Modal>
        )}
        <div className={styles.roomContainer}>
          {/* <GatherCreate
            createRoomFormSubmit={createRoomFormSubmit}
            createScheduleRoom={triggerNewRoom}
          /> */}
          <GatheringCreate
            createRoomFormSubmit={createRoomFormSubmit}
            createScheduleRoom={triggerNewRoom}
          />
 <GatherLoading />
          <ul
            className={styles.roomContainerActiveList}
            id="room_card current_rooms"
          >
            {(callRooms || []).map((room, idx) => {
              let owner = false;
              if (room?.hostName === creator?.name) {
                owner = true;
              }
              return (
                <li
                  key={idx}
                  className={`${room.gatheringType} ${styles.roomContainerRoomBox}`}
                >
                  <GatheringCard
                    cardType="general"
                    room={room}
                    joinHandler={() => joinRoom(room)}
                    peers={room.peers}
                    owner={owner}
                  />
                  <GatheringTile />
                </li>
              );
            })}
          </ul>

          {/* <button id="gathering_create" onClick={triggerNewRoom}>
  + gathering
</button> */}
        </div>
        <p>Scheduled</p>
        <ul className="room_card" id="room_card scheduled_rooms">
          {(scheduledcallRooms || []).map((room, idx) => {
            let owner = false;
            if (room?.hostName === creator?.name) {
              owner = true;
            }
            return (
              <li key={idx} className={`${room.gatheringType} room-container`}>
                <GatheringCard
                  cardType="schedule"
                  room={room}
                  user={creator}
                  peers={room.acceptedPeers}
                  owner={owner}
                  editScheduleRoom={triggerNewEditRoom}
                />
              </li>
            );
          })}
        </ul>
      </section>
    );
  }

  return (
    <div>
   

  <p>loading...</p>;
  </div>
  )
};

export default Video;
