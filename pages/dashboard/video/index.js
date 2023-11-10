import { useEffect, useState, useContext } from "react";
import { useComms } from "../../../contexts/comms";
import { useVideo } from "../../../contexts/video";
import { useAuth } from "../../../contexts/auth";
import { MobileContext } from "../../../contexts/mobile";
import { envUrls } from "../../../constants/urls";
import GatheringSchedule from "../../../components/Gathering/GatheringSchedule/GatheringSchedule";
import GatheringCreate from "../../../components/Gathering/GatheringCreate/GatheringCreate";
import { GatheringTile } from "../../../components/Gathering/GatheringTile/GatheringTile";
import { GatherLoading } from "../../../components/Gathering/GatherLoading/GatherLoading";
import styles from "./GatheringDashboard.module.scss";
import { generatePushMessage } from "services/helper";
import { sendPushNotification } from "requests/subscriptions";
import { useTourManager } from "contexts/tour";

const Video = () => {
  const [socketData, setSocketData] = useState({});
  const [newRoomToggled, setNewRoomToggled] = useState(false);
  const [newEditRoomToggled, setNewEditRoomToggled] = useState(false);
  const [newRoomData, setNewRoomData] = useState({
    gatheringType: "classic",
  });
  const [newEditRoomData, setEditRoomData] = useState();
  const { isMobile } = useContext(MobileContext);
  const {
    currentPage,
    selectedcomm,
    openMobileRoom,
    handleOpenMInimizedRoom,
    hasApprovedTos,
    hasFinishedFirstUseTour,
    hasFinishedFirstGatherTour,
  } = useComms();
  const {
    getInitialCallRooms,
    socketID,
    createEmptyRoom,
    callRooms,
    scheduledcallRooms,
  } = useVideo();
  const { user } = useAuth();

  const { activeTour, startTour } = useTourManager();

  useEffect(() => {
    if (socketID && selectedcomm) {
      let creator = selectedcomm.users.find((usr) => usr.userId === user._id);
      let data = {};
      data.icon = creator?.iconKey;
      data.name = creator?.name;
      data.harthid = selectedcomm._id;
      data.socketId = socketID;
      data.harthName = selectedcomm.name;
      setSocketData(data);
      getInitialCallRooms(data);
    }
  }, [socketID, selectedcomm]);

  useEffect(() => {
    if (
      hasApprovedTos &&
      hasFinishedFirstUseTour &&
      !activeTour &&
      !hasFinishedFirstGatherTour &&
      currentPage == "gather"
    ) {
      setTimeout(() => {
        startTour("firstGather", 0);
      }, 150);
    }
  }, [currentPage, hasApprovedTos, hasFinishedFirstUseTour, activeTour]);

  const joinRoom = (data) => {
    const urls = envUrls;
    if (isMobile) {
      const storedActiveRoom = sessionStorage.getItem("active_room");
      const parsedRoom = JSON.parse(storedActiveRoom);
      if (parsedRoom?.room_id === data.roomId) {
        handleOpenMInimizedRoom();
      } else {
        openMobileRoom({
          gather_window: true,
          room_type: data.gatheringType,
          user_name: socketData.name,
          user_img: socketData.icon,
          room_id: data.roomId,
          harth_id: selectedcomm._id,
          room_name: data.roomName,
          harth_icon: selectedcomm.iconKey,
        });
      }
    } else {
      const windowFeatures = "location=no,scrollbars=no,resizable=yes";

      window.open(
        /* eslint-disable-next-line */
        `${urls[process.env.NODE_ENV]}/dashboard/${
          data.gatheringType
        }?gather_window=true&room_type=${data.gatheringType}&user_name=${
          socketData.name
        }&user_img=${socketData.icon}&room_id=${data.roomId}&harth_id=${
          selectedcomm._id
        }&room_name=${data.roomName}&harth_icon=${selectedcomm.iconKey}`,
        "_blank",
        windowFeatures //"new-window"
      );
    }
  };
  const createRoom = (room) => {
    createEmptyRoom({ ...socketData, ...room }, (data) => {
      let pushData = {
        message: `Room ${data?.newGroupCallRoom.roomName} is now active!`,
        pushTitle: `Harth`,
        env: process.env.NODE_ENV,
        ignoreSelf: true,
        comm_id: selectedcomm._id,
        type: "gather",
        roomDetails: {
          gather_window: true,
          room_type: data?.newGroupCallRoom?.gatheringType,
          user_name: socketData.name,
          user_img: socketData.icon,
          room_id: data?.newGroupCallRoom?.roomId,
          harth_id: selectedcomm._id,
          room_name: data?.newGroupCallRoom?.roomName,
          harth_icon: selectedcomm.iconKey,
        },
      };

      if (data.setInitalTimer) {
        delete pushData.ignoreSelf;
      }

      try {
        let pushmessage = generatePushMessage(pushData);
        let receiverIds = selectedcomm?.users
          .filter((obj) => obj.userId !== user._id)
          .map((obj) => obj.userId);

        pushmessage.receiverIds = receiverIds;
        sendPushNotification(pushmessage);
      } catch (error) {
        console.log(error);
      }
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
      <section
        id="gatherings"
        className={`
        ${styles.gatheringPage}
        ${isMobile && styles.gatheringPageMobile}
        `}
      >
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
            room={newRoomData}
          />
        )}
        <div className={styles.roomContainer} id="tourFirstUse_gather">
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
              <div
                key={idx}
                className={`${room.gatheringType} ${
                  isMobile && styles.roomHolderMobile
                }`}
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
            );
          })}
        </div>
        {scheduledcallRooms.length > 0 ? (
          <p
            className={
              isMobile ? styles.gatheringSectionMobile : styles.gatheringSection
            }
          >
            The future
          </p>
        ) : null}

        <div className={styles.roomContainer}>
          {(scheduledcallRooms || []).map((room, idx) => {
            let owner = false;
            if (room?.hostName === creator?.name) {
              owner = true;
            }
            return (
              <div
                key={idx}
                className={`${room.gatheringType} ${
                  isMobile && styles.roomHolderMobile
                } room-container`}
              >
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
    <section id="gatherings" className={`${styles.gatheringPage}`}>
      {newRoomToggled && (
        <GatheringSchedule
          harthId={selectedcomm._id}
          harthName={selectedcomm.name}
          creator={selectedcomm.users.find((usr) => usr.userId === user._id)}
          closeHandler={() => setNewRoomToggled(false)}
          room={newRoomData}
        />
      )}
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
      </div>
    </section>
  );
};

export default Video;
