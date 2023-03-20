import { useState, useContext, useRef } from "react";
import { useForm } from "react-hook-form";

import { IconEvent } from "../../../resources/icons/IconEvent";
import { IconPlayCircle } from "../../../resources/icons/IconPlayCircle";
import ErrorMessage from "../../Common/Input/ErrorMessage";

import { GatheringButton } from "./GatheringButton";
import { MobileContext } from "../../../contexts/mobile";

import styles from "./GatheringCreate.module.scss";

const GatheringCreate = ({ createScheduleRoom, createRoomFormSubmit }) => {
    const [activeButton, setActiveButton] = useState("voice");
    // const [roomName, setRoomName] = useState("");

    const isScheduleRoom = useRef(false);

    const { isMobile } = useContext(MobileContext);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm();

    // const inputChangeHandler = (e) => {
    //     const { value } = e.target;
    //     setRoomName(value);
    // };

    const createRoomSubmit = (formData) => {
        if (isScheduleRoom.current) {
            createScheduleRoom({
                roomName: formData.roomName,
                gatheringType: activeButton,
            });
            isScheduleRoom.current = false;
            reset({ roomName: "" });
            setActiveButton("voice");
        } else {
            createRoomFormSubmit({
                roomName: formData.roomName,
                gatheringType: activeButton,
            });
            reset({ roomName: "" });
            setActiveButton("voice");
        }
    };

    return (
        <div
            className={`
            ${styles.GatheringCreate}
            ${isMobile && styles.GatheringCreateMobile}
            `}
        >
            <form
                onSubmit={handleSubmit(createRoomSubmit)}
                className={styles.Content}
            >
                <div className={styles.GatheringCreateInput}>
                    <input
                        placeholder="room name"
                        autoComplete="off"
                        // onChange={roomNameHandler}
                        // isError={isSubmitting ? !roomName.VALID : false}
                        // error={roomName.ERROR}
                        // value={roomName.VALUE}
                        //className={styles.GatheringCreateInput}
                        // changeHandler={() => {}}
                        // inputhandler={inputChangeHandler}
                        {...register("roomName", { required: true })}
                        maxLength={64}
                    />
                    <ErrorMessage
                        errorMsg={
                            errors.roomName
                                ? "Gathering name is required"
                                : null
                        }
                    />
                </div>
                <div className={styles.GatheringCreateLabelHolder}>
                    <div className={styles.GatheringCreateLabelText}>
                        Select a gathering type
                    </div>
                    <div className={styles.GatheringCreateType}>
                        <GatheringButton
                            type="voice"
                            activeButtonHandler={() => setActiveButton("voice")}
                            active={activeButton == "voice"}
                        />
                        <GatheringButton
                            type="stream"
                            activeButtonHandler={() =>
                                setActiveButton("stream")
                            }
                            active={activeButton == "stream"}
                        />
                        <GatheringButton
                            type="party"
                            activeButtonHandler={() => setActiveButton("party")}
                            active={activeButton == "party"}
                        />
                    </div>
                    {activeButton == "voice" && (
                        <p className={styles.GatheringCreateSubText}>
                            Voice and text chat
                        </p>
                    )}
                    {activeButton == "stream" && (
                        <p className={styles.GatheringCreateSubText}>
                            Stream games and video
                        </p>
                    )}
                    {activeButton == "party" && (
                        <p className={styles.GatheringCreateSubText}>
                            Video chat and tabletop play
                        </p>
                    )}
                </div>

                <div className={styles.GatheringCreateLaunch}>
                    <button
                        type="button"
                        className={` ${styles.GatheringCreateSubmit} ${styles.GatheringCreateSubmitSchedule} `}
                        onClick={() => {
                            isScheduleRoom.current = true;
                            let butt = document.getElementById("submit_button");
                            if (butt) {
                                butt.click();
                            }
                        }}
                    >
                        <IconEvent />
                        Schedule
                    </button>
                    <button
                        type="submit"
                        id="submit_button"
                        className={styles.GatheringCreateSubmit}
                        // onClick={() =>
                        //     createRoomFormSubmit({
                        //         roomName,
                        //         gatheringType: activeButton,
                        //     })
                        // }
                    >
                        <IconPlayCircle />
                        Start Now
                    </button>
                </div>
            </form>
        </div>
    );
};

export default GatheringCreate;
