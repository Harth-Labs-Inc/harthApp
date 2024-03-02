import { useState, useContext, useRef } from "react";
import { useForm } from "react-hook-form";
import { IconClock } from "resources/icons/IconClock";
import { IconPlayCircle } from "resources/icons/IconPlayCircle";
import { GatheringButton } from "./GatheringButton";
import { MobileContext } from "../../../contexts/mobile";
import styles from "./GatheringCreate.module.scss";

const GatheringCreate = ({ createScheduleRoom, createRoomFormSubmit }) => {
    const [activeButton, setActiveButton] = useState("voice");
    const [textEntered, setTextEntered] = useState(false);
    const isScheduleRoom = useRef(false);
    const { isMobile } = useContext(MobileContext);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm();


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

    const handleInputChange = (e) => {
        setTextEntered(e.target.value.length > 0);
    };

    return (
        <div
            className={`
            ${isMobile ? styles.Mobile : styles.Desktop}
            `}
        >
            <div className={styles.title}>Create a Gathering</div>
            <form
                onSubmit={handleSubmit(createRoomSubmit)}
                className={styles.Content}
            >

                <div className={styles.Entry}>
                    <input
                        placeholder="enter a room name"
                        autoComplete="off"
                        autoCapitalize="off"
                        {...register("roomName", { required: true })}
                        maxLength={64}
                        onChange={handleInputChange}
                    />  
                    {errors.roomName ?
                        <span>Room name is required</span>
                        : null 
                    }
                    
                </div>
                {/* <div className={styles.arrow}><IconChevronRight /></div> */}
                <div className={styles.Type}>
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
                

                    <div className={styles.LabelHolder}>
                        {activeButton == "voice" && (
                            <p>
                                Voice and text chat
                            </p>
                        )}
                        {activeButton == "stream" && (
                            <p>
                                Stream games and video
                            </p>
                        )}
                        {activeButton == "party" && (
                            <p>
                                Video chat
                            </p>
                        )}
                    </div>
                </div>
                {/* <div className={styles.arrow}><IconChevronRight /></div> */}
                
                <div className={styles.Launch}>
                    <button
                        type="button"
                        className={` ${styles.Submit} ${styles.SubmitSchedule} `}
                        onClick={() => {
                            isScheduleRoom.current = true;
                            let butt = document.getElementById("submit_button");
                            if (butt) {
                                butt.click();
                            }
                        }}
                    >
                        <IconClock />
                        Schedule
                    </button>
                    <button
                        type="submit"
                        id="submit_button"
                        className={`
                            ${styles.Submit}
                            ${textEntered ? styles.SubmitActive : null}
                            `}
                        // onClick={() =>
                        //     createRoomFormSubmit({
                        //         roomName,
                        //         gatheringType: activeButton,
                        //     })
                        // }
                    >
                        <IconPlayCircle />
                        Launch
                    </button>
                </div>
            </form>
        </div>
    );
};

export default GatheringCreate;
