import { useEffect, useState, useContext } from "react";
import { combineDateTime, formatTimeString } from "services/helper";
import { updateScheduleRoom } from "../../../requests/rooms";
import { IconEditFill } from "../../../resources/icons/IconEditFill";
import { RoomParty } from "resources/icons/RoomParty";
import { RoomStream } from "resources/icons/RoomStream";
import { RoomVoice } from "resources/icons/RoomVoice";
import { useVideo } from "../../../contexts/video";
import { MobileContext } from "../../../contexts/mobile";
import GatheringTileControls from "./GatheringTileControls";
import styles from "./GatheringTile.module.scss";

export const GatheringTile = (props) => {
  const [isInRoom, setIsInRoom] = useState(false);
  const [localTime, setLocalTime] = useState(null);
  const [localDate, setLocalDate] = useState(null);
  const [localDay, setLocalDay] = useState(null);
  const days = ['Sun', 'Mon', 'Tues', 'Wed', 'Thu', 'Fri', 'Sat'];
  const { room, user, peers, owner, cardType, joinHandler, editScheduleRoom } =
    props;

  const { refreshScheduledCallRooms } = useVideo();
  const { isMobile } = useContext(MobileContext);


  useEffect(() => {
    if (room) {
      if (room.localTimeDate) {
        try {
          const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
          const userDateTime = new Date(room.localTimeDate).toLocaleString(
            "en-US",
            {
              timeZone: userTimeZone,
            }
          );
          const day = new Date(room.localTimeDate).getDay();
          const [date, time] = userDateTime.split(",");
          setLocalTime(formatTimeString(time));
          setLocalDate(date);
          setLocalDay(day);
        } catch (error) {
          console.log(error);
        }
      }
    }

    return () => {
      setLocalTime(null);
      setLocalDate(null);
    };
  }, [room]);

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
      return <RoomVoice />;
    }
    if (room.gatheringType === "stream") {
      return <RoomStream />;
    }
    if (room.gatheringType === "party") {
      return <RoomParty />;
    }
  };

  const handleJoinRoom = async () => {
    if (cardType === "schedule") {
      let tempRoom = { ...room };
      tempRoom.acceptedPeers.push({
        ...user,
        img: user.iconKey,
      });
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
    }
  };

  const dateFormat = () => {
    let date =
      new Date(localDate) ||
      combineDateTime(room.gatheringDate, room.gatheringTime);
    const scheduleDate = date.toLocaleDateString([], {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });

    return scheduleDate;
  };
  /* eslint-disable */

  return (
    <div className={isMobile ? styles.Mobile : styles.Desktop}>
      <div className={styles.Top}>
        <div className={styles.iconHolder}>
          <Icon />
        </div>
        <p className={styles.name}>{room.roomName}</p>
      </div>

      <div className={styles.Bottom}>
        <div className={styles.Info}>
          {cardType === "schedule" ? (
            <>
              <div>
                <p className={styles.day}>
                  {days[localDay]}
                </p>
                <p className={styles.time}>
                  {localTime || room.gatheringTime}
                </p>
              </div>
              <p className={styles.date}>
                {dateFormat()}
              </p>
            </>
          ) : (
            <div className={styles.now}>NOW</div>
          )}

        </div>

        <div className={styles.Details}>

          <div className={styles.AttendeeWrapper}>
                {peers.length > 0 ? (
                  peers.map((peer, idx) => {
                    return (
                      <div key={`${peer.id}${idx}`}>
                        {peer.img ? (
                          <div className={styles.profileImage} title={peer.name}>
                            <img src={peer.img} loading="lazy" />
                          </div>
                        ) : (
                          <div className={styles.empty} title={peer.name}>
                            ?
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <>
                    <div className={styles.emptyMessage}>( empty )</div>
                  </>
                )}
          </div>

          <p className={styles.description}>
            {room.gatheringDescription}
          </p>
              
        

          <div className={styles.ActionBar}>
            {owner && cardType === "schedule" ? (
              <button
                onClick={() => editScheduleRoom(room)}
                className={styles.ActionBarEdit}
              >
                <IconEditFill />
              </button>
            ) : null}

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

      

        
    </div>

  );
};
