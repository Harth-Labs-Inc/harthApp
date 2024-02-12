import { useForm } from "react-hook-form";
import ErrorMessage from "../../Common/Input/ErrorMessage";
import { convertToAmPm, combineDateTime } from "../../../services/helper";
import { Button, Modal } from "../../Common";
import { useVideo } from "../../../contexts/video";
import { saveRoom } from "../../../requests/rooms";
import {
    updateScheduleRoom,
    deleteScheduledRoom,
} from "../../../requests/rooms";
import styles from "./GatheringSchedule.module.scss";
import { IconDeleteNoFill } from "../../../resources/icons/IconDeleteNoFill";
import { useState } from "react";
import { RoomStream } from "resources/icons/RoomStream";
import { RoomParty } from "resources/icons/RoomParty";
import { RoomVoice } from "resources/icons/RoomVoice";

const GatheringSchedule = (props) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    let defaults = { defaultValues: {} };

    defaults.defaultValues = {
        ...props.room,
    };

    function getHTML5DateTimeStringsFromDate(d) {
        // Date string
        let ds =
            d.getFullYear().toString().padStart(4, "0") +
            "-" +
            (d.getMonth() + 1).toString().padStart(2, "0") +
            "-" +
            d.getDate().toString().padStart(2, "0");

        // Time string
        let ts =
            d.getHours().toString().padStart(2, "0") +
            ":" +
            d.getMinutes().toString().padStart(2, "0");

        // Return them in array
        return [ds, ts];
    }

    if (!props.type) {
        let d = new Date();
        let dstrings = getHTML5DateTimeStringsFromDate(d);
        defaults.defaultValues.gatheringDate = dstrings[0];
        defaults.defaultValues.gatheringTime = dstrings[1];
    } else if (props.type == "edit") {
        let d = combineDateTime(
            props.room?.gatheringDate,
            props.room?.gatheringTime
        );
        let dstrings = getHTML5DateTimeStringsFromDate(d);
        defaults.defaultValues.gatheringDate = dstrings[0];
        defaults.defaultValues.gatheringTime = dstrings[1];
    }

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm(defaults);

    const {
        pushScheduledRoom,
        socketID,
        refreshScheduledCallRooms,
        sendGatherNotification,
    } = useVideo();

    const watchType = watch("gatheringType");

    async function scheduleGathering(formData) {
        setIsSubmitting(true);
        let newRoom = { ...formData };

        if (newRoom && newRoom.gatheringTime) {
            newRoom.gatheringTime = convertToAmPm(newRoom.gatheringTime);
        }

        const scheduledDateTime = combineDateTime(
            newRoom.gatheringDate,
            newRoom.gatheringTime
        );
        newRoom.localTimeDate = scheduledDateTime;
        if (props.type !== "edit") {
            newRoom.harthId = props.harthId;
            newRoom.hostName = props.creator.name;
            newRoom.icon = props.creator.iconKey || "";
            newRoom.harthName = props.harthName;
            newRoom.socketId = socketID;
            newRoom.acceptedPeers = [
                { ...props.creator, img: props.creator.iconKey },
            ];

            const data = await saveRoom(newRoom);

            let { id, ok } = data || {};
            if (ok) {
                if (id) {
                    newRoom._id = id;
                    sendGatherNotification(newRoom);
                    pushScheduledRoom(newRoom);
                    props.closeHandler();
                }
            }
        } else {
            newRoom = { ...props.room, ...newRoom };
            await updateScheduleRoom(newRoom);
            refreshScheduledCallRooms(newRoom);
            props.closeHandler();
        }
        setIsSubmitting(false);
    }

    async function handleDelete() {
        await deleteScheduledRoom(props.room?._id);
        refreshScheduledCallRooms(props.room);
        props.closeHandler();
    }

    return (
        <Modal onToggleModal={props.closeHandler}>
            <form className={styles.GatheringSchedule} onSubmit={handleSubmit(scheduleGathering)}>
                
            {props.type === "edit" ? (
                <p className={styles.title}>Edit gathering</p>
            ) : (
                <p className={styles.title}>Create a gathering</p>
            )}
                <p className={styles.GatheringScheduleSubTitle}>Enter a name</p>
                <input
                    {...register("roomName", { required: true })}
                    placeholder="room name"
                    type="text"
                    className={styles.GatheringScheduleInput}
                    autoComplete="off"
                />
                <ErrorMessage
                    errorMsg={
                        errors.gatheringName
                            ? "Gathering name is required"
                            : null
                    }
                />

                <p className={styles.GatheringScheduleSubTitle}>Enter a date</p>
                <div className={styles.GatheringScheduleDateTime}>
                    <input
                        {...register("gatheringDate", { required: true })}
                        type="date"
                    />
                    <input
                        {...register("gatheringTime", { required: true })}
                        type="time"
                    />
                </div>

                <p className={styles.GatheringScheduleSubTitle}>Select type</p>
                <div className={styles.GatheringScheduleType}>
                    <label
                        className={`${styles.GatheringScheduleTypeSelect} ${
                            watchType === "voice" ? styles.Active : null
                        }`}
                    >
                        <RoomVoice/>
                        Voice
                        <input
                            {...register("gatheringType", { required: true })}
                            type="radio"
                            value="voice"
                        />
                    </label>
                    <label
                        className={`${styles.GatheringScheduleTypeSelect} ${
                            watchType === "stream" ? styles.Active : null
                        }`}
                    >
                        <RoomStream />
                        Stream
                        <input
                            {...register("gatheringType", { required: true })}
                            type="radio"
                            value="stream"
                        />
                    </label>
                    <label
                        className={`${styles.GatheringScheduleTypeSelect} ${
                            watchType === "party" ? styles.Active : null
                        }`}
                    >
                        <RoomParty />
                        Party
                        <input
                            {...register("gatheringType", { required: true })}
                            type="radio"
                            value="party"
                        />
                    </label>
                </div>
                <div className={styles.LabelHolder}>
                        {watchType == "voice" && (
                            <p>
                                Voice and text chat
                            </p>
                        )}
                        {watchType == "stream" && (
                            <p>
                                Stream games and video
                            </p>
                        )}
                        {watchType == "party" && (
                            <p>
                                Video chat
                            </p>
                        )}
                    </div>
                <p className={styles.GatheringScheduleSubTitle}>
                    Enter a description (optional)
                </p>
                <textarea
                    {...register("gatheringDescription")}
                    placeholder="let's all..."
                    autoComplete="off"
                    spellCheck="true"

                    className={styles.description}
                />
                <div className={styles.GatheringScheduleButtons}>
                    {props.type === "edit" ? (
                        <button
                            onClick={handleDelete}
                            className={styles.delete}
                        >
                            <IconDeleteNoFill />
                        </button>
                    ) : null}
                    <Button
                        tier="secondary"
                        text="Cancel"
                        onClick={props.closeHandler}
                    />
                    <Button
                        fullWidth
                        type="Submit"
                        text={props.type === "edit" ? "Update" : "Schedule"}
                        isLoading={isSubmitting}
                    />
                </div>
            </form>
        </Modal>
    );
};

export default GatheringSchedule;
