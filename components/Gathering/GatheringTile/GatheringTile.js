import { useEffect, useState } from "react";

import { Avatar, Button } from "../../Common";
// import { EditGathering } from "../Buttons/EditGathering";

import { IconHeadsetMic } from "../../../resources/icons/IconHeadsetMic";
import { IconCastNoFill } from "../../../resources/icons/IconCastNoFill";
import { IconWorkspace } from "../../../resources/icons/IconWorkspace";
import { IconEditFill } from "../../../resources/icons/IconEditFill";

import GatheringTileControls from "./GatheringTileControls";
import styles from "./GatheringTile.module.scss";

export const GatheringTile = (props) => {
    const [isInRoom, setIsInRoom] = useState(false);
    const {
        room,
        user,
        peers,
        owner,
        cardType,
        joinHandler,
        editScheduleRoom,
    } = props;
    // const navigation = useNavigation();

    //not sure how timestamp shows up but probably need to process it somehow

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

    const handleJoinRoom = () => {
        if (cardType === "schedule") {
        } else {
            joinHandler();
        }
    };
    const handleDropRoom = () => {
        console.log("drop");
    };

    const dateFormat = () => {
        const date = new Date(room.gatheringDate);
        const scheduleDate = date.toLocaleDateString([], {
            month: "short",
            day: "2-digit",
        });

        return scheduleDate;
    };

    useEffect(() => {
        console.log(room, "room");
    }, [room]);

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
                                    <p
                                        className={
                                            styles.GatheringTileScheduledTime
                                        }
                                    >
                                        {room.gatheringTime}
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
                            {peers.map((peer, index) => {
                                const zIndex = peers.length - index;
                                return (
                                    <Avatar
                                        key={peer.peerId}
                                        imageSrc={peer.img}
                                        customStyle={zIndex}
                                    />
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
                            onClick={editScheduleRoom}
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
                    />
                </div>
            </div>
        </div>
    );
};
