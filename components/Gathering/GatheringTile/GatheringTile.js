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
                return peer.name === user.name;
            });

            setIsInRoom(inRoom);
        }
    }, [peers, user]);

    const Icon = () => {
        if (room.gatheringType === "voice") {
            return <IconHeadsetMic fill="#0DA1B5" />;
        }
        if (room.gatheringType === "stream") {
            return <IconCastNoFill fill="#F06573" />;
        }
        if (room.gatheringType === "party") {
            return <IconWorkspace fill="#BB7EC4" />;
        }
    };

    const handleJoinRoom = () => {
        if (cardType === "schedule") {
        } else {
            joinHandler();
        }
        joinHandler();
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
                cardType !== "schedule" ? styles[room.gatheringType] : null
            }`}
        >
            <div className={styles.GatheringTileLabel}>
                <div className={styles.GatheringTileLabelIcon}>
                    <Icon />
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
                            {peers.forEach((peer) => {
                                console.log(peer, "peer");
                                return <Avatar imageSrc={peer.img} />;
                            })}
                        </div>
                        <p className={styles.GatheringTileDescription}>
                            {room.gatheringDescription}
                        </p>
                    </div>
                </div>
                <div className={styles.GatheringTileActionBar}>
                    {owner ? (
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
