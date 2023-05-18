import { useEffect, useState, useContext } from "react";
import { combineDateTime, formatTimeString } from "services/helper";
import { updateScheduleRoom } from "../../../requests/rooms";
import { IconHeadsetMic } from "../../../resources/icons/IconHeadsetMic";
import { IconCastNoFill } from "../../../resources/icons/IconCastNoFill";
import { IconWorkspace } from "../../../resources/icons/IconWorkspace";
import { IconEditFill } from "../../../resources/icons/IconEditFill";
import { useVideo } from "../../../contexts/video";
import { MobileContext } from "../../../contexts/mobile";
import GatheringTileControls from "./GatheringTileControls";
import styles from "./GatheringTile.module.scss";

export const GatheringTile = (props) => {
    const [isInRoom, setIsInRoom] = useState(false);
    const [localTime, setLocalTime] = useState(null);
    const [localDate, setLocalDate] = useState(null);

    const {
        room,
        user,
        peers,
        owner,
        cardType,
        joinHandler,
        editScheduleRoom,
    } = props;

    const { refreshScheduledCallRooms } = useVideo();
    const { isMobile } = useContext(MobileContext);

    useEffect(() => {
        if (room) {
            if (room.localTimeDate) {
                try {
                    const userTimeZone =
                        Intl.DateTimeFormat().resolvedOptions().timeZone;
                    const userDateTime = new Date(
                        room.localTimeDate
                    ).toLocaleString("en-US", {
                        timeZone: userTimeZone,
                    });
                    const [date, time] = userDateTime.split(",");
                    setLocalTime(formatTimeString(time));
                    setLocalDate(date);
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
        <div
            className={`
        ${styles.GatheringTile} 
        ${isMobile && styles.GatheringTileMobile}
        ${
            cardType == "schedule"
                ? styles[room.gatheringType]
                : styles[room.gatheringType + "Active"]
        }

      
      `}
        >
            <div className={styles.GatheringTileLabel}></div>
            <div className={styles.Info}>
                <div className={styles.TopHolder}>
                    <div className={styles.GatheringTileType}>
                        <div className={styles.iconHolder}>
                            <Icon />
                        </div>
                        <p className={styles.roomTitle}>{room.gatheringType}</p>
                    </div>
                    <p className={styles.GatheringTileName}>{room.roomName}</p>
                </div>

                <div className={styles.GatheringTileInfoStructure}>
                    <div className={styles.GatheringTileScheduled}>
                        {cardType === "schedule" ? (
                            <>
                                <div>
                                    <p
                                        className={
                                            styles.GatheringTileScheduledTime
                                        }
                                    >
                                        {localTime || room.gatheringTime}
                                    </p>
                                </div>
                                <p
                                    className={
                                        styles.GatheringTileScheduledDate
                                    }
                                >
                                    {dateFormat()}
                                </p>
                            </>
                        ) : (
                            <span className={styles.GatheringTileScheduledNow}>
                                NOW
                            </span>
                        )}
                    </div>
                    <div className={styles.GatheringTilePeopleDescription}>
                        <div className={styles.GatheringTileAttendeeWrapper}>
                            {peers.length > 0 ? (
                                peers.map((peer) => {
                                    return (
                                        <>
                                            {peer.img ? (
                                                <div
                                                    key={peer.id}
                                                    className={
                                                        styles.profileImage
                                                    }
                                                    title={peer.name}
                                                >
                                                    <img
                                                        src={peer.img}
                                                        loading="lazy"
                                                    />
                                                </div>
                                            ) : (
                                                <div
                                                    key={peer.id}
                                                    className={styles.empty}
                                                    title={peer.name}
                                                >
                                                    ?
                                                </div>
                                            )}
                                        </>
                                    );
                                })
                            ) : (
                                <>
                                    <div className={styles.emptyMessage}>
                                        ( empty )
                                    </div>
                                </>
                            )}
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
    );
};
