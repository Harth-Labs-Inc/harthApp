import { useEffect, useState, useContext } from "react";
import { useForm } from "react-hook-form";

import { IconEvent } from "../../../resources/icons/IconEvent";
import { IconPlayCircle } from "../../../resources/icons/IconPlayCircle";
import ErrorMessage from "../../Common/Input/ErrorMessage";

import { GatheringButton } from "./GatheringButton";
import { MobileContext } from "../../../contexts/mobile";

import styles from "./GatheringCreate.module.scss";

const GatheringCreate = ({ createScheduleRoom, createRoomFormSubmit }) => {
  const [activeButton, setActiveButton] = useState("voice");
  const [roomName, setRoomName] = useState("");
  const { isMobile } = useContext(MobileContext);

  const {
    register,
    handleSubmit,
    reset,
    formState,
    formState: { errors, isSubmitSuccessful },
  } = useForm();

  useEffect(() => {
    if (isSubmitSuccessful) {
      reset({ roomName: "" });
    }
  }, [formState, reset]);

  const inputChangeHandler = (e) => {
    const { value } = e.target;
    setRoomName(value);
  };

  const createRoomSubmit = (formData) => {
    createRoomFormSubmit({
      roomName: formData.roomName,
      gatheringType: activeButton,
    });
  };

  return (
    <div
      className={`
            ${styles.GatheringCreate}
            ${isMobile && styles.GatheringCreateMobile}
            `}
    >
      <form onSubmit={handleSubmit(createRoomSubmit)}>
        <div className={styles.Content}>
          <input
            placeholder="room name"
            autoComplete="off"
            // onChange={roomNameHandler}
            // isError={isSubmitting ? !roomName.VALID : false}
            // error={roomName.ERROR}
            // value={roomName.VALUE}
            className={styles.GatheringCreateInput}
            changeHandler={() => {}}
            inputhandler={inputChangeHandler}
            {...register("roomName", { required: true })}
            maxLength={64}
          />
          <ErrorMessage
            errorMsg={errors.roomName ? "Gathering name is required" : null}
          />
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
                activeButtonHandler={() => setActiveButton("stream")}
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
        </div>
        <div className={styles.GatheringCreateLaunch}>
          <button
            type="button"
            className={` ${styles.GatheringCreateSubmit} ${styles.GatheringCreateSubmitSchedule} `}
            onClick={() => {
              createScheduleRoom({
                roomName,
                gatheringType: activeButton,
              });
            }}
          >
            <IconEvent />
            Schedule
          </button>
          <button
            type="submit"
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
