import { useForm } from "react-hook-form";
import ErrorMessage from "../../Common/Input/ErrorMessage";
import { convertToAmPm } from "../../../services/helper";
import { Button, Modal } from "../../Common";
import { useVideo } from "../../../contexts/video";
import { saveRoom } from "../../../requests/rooms";

import { IconHeadsetMic } from "../../../resources/icons/IconHeadsetMic";
import { IconCastNoFill } from "../../../resources/icons/IconCastNoFill";
import { IconWorkspace } from "../../../resources/icons/IconWorkspace";
import styles from "./GatheringSchedule.module.scss";
import { IconDeleteNoFill } from "../../../resources/icons/IconDeleteNoFill";

const GatheringSchedule = (props) => {
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm();

    const { pushScheduledRoom, socketID } = useVideo();

    const watchType = watch("gatheringType");

    async function scheduleGathering(formData) {
        let newRoom = { ...formData };

        if (newRoom && newRoom.gatheringTime) {
            newRoom.gatheringTime = convertToAmPm(newRoom.gatheringTime);
        }
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
                pushScheduledRoom(newRoom);
                props.closeHandler();
            }
        }
    }

    function handleDelete() {
        console.log("delete");
    }

    return (
        <Modal onToggleModal={props.closeHandler}>
            <p className={styles.GatheringScheduleTitle}>
                {props.type === "edit" ? "Edit" : "Schedule a"} gathering
            </p>
            <form onSubmit={handleSubmit(scheduleGathering)}>
                <input
                    {...register("roomName", { required: true })}
                    placeholder="[profile name's] party"
                    type="text"
                />
                <ErrorMessage
                    errorMsg={
                        errors.gatheringName
                            ? "Gathering name is required"
                            : null
                    }
                />
                <p className={styles.GatheringScheduleSubTitle}>Choose date</p>
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

                <p className={styles.GatheringScheduleSubTitle}>Choose type</p>
                <div className={styles.GatheringScheduleType}>
                    <label
                        className={`${styles.GatheringScheduleTypeSelect} ${
                            watchType === "voice" ? styles.Active : null
                        }`}
                    >
                        <span>
                            <IconHeadsetMic
                                fill={
                                    watchType === "voice" ? "#fff" : "#2F1D2A80"
                                }
                            />
                        </span>
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
                        <span>
                            <IconCastNoFill
                                fill={
                                    watchType === "stream"
                                        ? "#fff"
                                        : "#2F1D2A80"
                                }
                            />
                        </span>
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
                        <span>
                            <IconWorkspace
                                fill={
                                    watchType === "party" ? "#fff" : "#2F1D2A80"
                                }
                            />
                        </span>
                        Party
                        <input
                            {...register("gatheringType", { required: true })}
                            type="radio"
                            value="party"
                        />
                    </label>
                </div>

                <p className={styles.GatheringScheduleSubTitle}>
                    Give a description (optional)
                </p>
                <input
                    {...register("gatheringDescription")}
                    placeholder="let's all..."
                />
                <div className={styles.GatheringScheduleButtons}>
                    {props.type === "edit" ? (
                        <button onClick={handleDelete}>
                            <IconDeleteNoFill />
                        </button>
                    ) : null}
                    <Button
                        tier="secondary"
                        text="Cancel"
                        onClick={props.closeHandler}
                    />
                    <Button fullWidth type="Submit" text="Schedule" />
                </div>
            </form>
        </Modal>
    );
};

export default GatheringSchedule;
