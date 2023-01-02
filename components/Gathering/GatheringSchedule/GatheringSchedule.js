import { useForm } from "react-hook-form";
import ErrorMessage from "../../Common/Input/ErrorMessage";
import { convertToAmPm } from "../../../services/helper";
import { Button, Modal } from "../../Common";
import { useVideo } from "../../../contexts/video";
import { saveRoom } from "../../../requests/rooms";

const GatheringSchedule = (props) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const { pushScheduledRoom, socketID } = useVideo();

    async function scheduleGathering(formData) {
        console.log(props);
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
        console.log(newRoom);
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

    return (
        <Modal onToggleModal={props.closeHandler}>
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
                <p>Choose date</p>
                <input
                    {...register("gatheringDate", { required: true })}
                    type="date"
                />
                <input
                    {...register("gatheringTime", { required: true })}
                    type="time"
                />
                <p>Choose type</p>
                <p>Give a description (optional)</p>
                <input
                    {...register("gatheringDescription")}
                    placeholder="let's all..."
                />
                <div>
                    <Button text="Cancel" onClick={props.closeHandler} />
                    <Button type="Submit" text="Schedule" />
                </div>
            </form>
        </Modal>
    );
};

export default GatheringSchedule;
