import { useEffect, useState } from "react";

import { updateScheduleRoom } from "../../../requests/rooms";
import { IconHeadsetMic } from "../../../resources/icons/IconHeadsetMic";
import { IconCastNoFill } from "../../../resources/icons/IconCastNoFill";
import { IconWorkspace } from "../../../resources/icons/IconWorkspace";
import { IconEditFill } from "../../../resources/icons/IconEditFill";
import { useVideo } from "../../../contexts/video";

import GatheringTileControls from "./GatheringTileControls";
import styles from "./GatheringTile.module.scss";

export const GatheringTile = (props) => {
  const [isInRoom, setIsInRoom] = useState(false);
  const { room, user, peers, owner, cardType, joinHandler, editScheduleRoom } =
    props;

  const { refreshScheduledCallRooms } = useVideo();

  useEffect(() => {
    if (peers && peers.length && user) {
      let inRoom = peers?.find((peer) => {
        return peer.userId === user.userId;
      });

      setIsInRoom(inRoom);
    }
  }, [peers, user]);

  const Icon = () => {
    if (room.gatheringType === "voice") {
      return <IconHeadsetMic />;
    }
    if (room.gatheringType === "stream") {
      return <IconCastNoFill />;
    }
    if (room.gatheringType === "party") {
      return <IconWorkspace />;
    }
  };

  const handleJoinRoom = async () => {
    if (cardType === "schedule") {
      console.log("join");
      let tempRoom = { ...room };
      tempRoom.acceptedPeers.push({
        ...user,
        img: user.iconKey,
      });
      console.log(tempRoom);
      await updateScheduleRoom(tempRoom);
      refreshScheduledCallRooms(room);
    } else {
      joinHandler();
    }
  };
  const handleDropRoom = async () => {
    if (cardType === "schedule") {
      let tempRoom = { ...room };
      tempRoom.acceptedPeers = tempRoom.acceptedPeers.filter(
        (peer) => peer.name !== user.name
      );
      await updateScheduleRoom(tempRoom);
      refreshScheduledCallRooms(room);
    } else {
    }
  };

  const dateFormat = () => {
    const date = new Date(room.gatheringDate);
    const scheduleDate = date.toLocaleDateString([], {
      month: "short",
      day: "2-digit",
    });

    return scheduleDate;
  };

  return (
    <div
      className={`${styles.GatheringTile} ${
        cardType == "schedule"
          ? styles[room.gatheringType]
          : styles[room.gatheringType + "Active"]
      }`}
    >
      <div className={styles.GatheringTileLabel}>
        <div className={styles.GatheringTileLabelIcon}>
          <Icon />
        </div>
        <div className={styles.GatheringTileLabelText}>
          {room.gatheringType}
        </div>
      </div>

      <div className={styles.GatheringTileInfo}>
        <p className={styles.GatheringTileName}>{room.roomName}</p>

        <div className={styles.GatheringTileInfoStructure}>
          <div className={styles.GatheringTileScheduled}>
            {cardType === "schedule" ? (
              <>
                <div>
                  <p className={styles.GatheringTileScheduledTime}>
                    {room.gatheringTime}
                  </p>
                </div>
                <p className={styles.GatheringTileScheduledDate}>
                  {dateFormat()}
                </p>
              </>
            ) : (
              <span className={styles.GatheringTileScheduledNow}>NOW</span>
            )}
          </div>
          <div className={styles.GatheringTilePeopleDescription}>
            <div className={styles.GatheringTileAttendeeWrapper}>
              {peers.map((peer, index) => {
                const zIndex = peers.length - index;
                return (
                  <>
                  {peer.img 
                    ? <div className={styles.profileImage} title={peer.name}><img src={peer.img} /></div>
                    : <div className={styles.empty} title={peer.name}>?</div>
                  }
                  </>
                );
              })}
            </div>
            <p className={styles.GatheringTileDescription}>
              {room.gatheringDescription}
            </p>
          </div>
        </div>
        <div className={styles.GatheringTileActionBar}>
          {owner && cardType === "schedule" ? (
            <button
              onClick={() => editScheduleRoom(room)}
              className={styles.GatheringTileActionBarEdit}
            >
              <IconEditFill />
              edit
            </button>
          ) : null}
          {/* <EditGathering onPress={pressing}/> */}
          <GatheringTileControls
            isInRoom={isInRoom}
            cardType={cardType}
            handleJoinRoom={handleJoinRoom}
            handleDropRoom={handleDropRoom}
            owner={owner}
          />
        </div>
      </div>
    </div>
  );
};
