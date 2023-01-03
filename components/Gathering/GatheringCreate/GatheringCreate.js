import { useState } from "react";
import { Button, Input } from "../../Common";

import { GatheringButton } from "./GatheringButton";
import styles from "./GatheringCreate.module.scss";

const GatheringCreate = ({ createScheduleRoom, createRoomFormSubmit }) => {
  const [activeButton, setActiveButton] = useState("voice");
  const [roomName, setRoomName] = useState("");

  const inputChangeHandler = (e) => {
    const { value } = e.target;
    setRoomName(value);
  };

  console.log(roomName, activeButton);

  return (
    <div className={styles.GatheringCreate}>
      <div className={styles.GatheringCreateSetup}>
        <Input
          placeholder="Profile Name's Room"
          // onChange={roomNameHandler}
          // isError={isSubmitting ? !roomName.VALID : false}
          // error={roomName.ERROR}
          // value={roomName.VALUE}
          className={styles.GatheringCreateInput}
          changeHandler={() => {}}
          inputhandler={inputChangeHandler}
        />
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
          <p className={styles.GatheringCreateSubText}>Voice and text chat</p>
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
        {/* <AppText>{isSubmitting && !activeButton ? "button required" : null}</AppText> */}
      </div>
      <div className={styles.GatheringCreateLaunch}>
        <button
          className={styles.GatheringCreateSubmit}
          onClick={() =>
            createScheduleRoom({ roomName, gatheringType: activeButton })
          }
          // style={({ pressed }) => [
          //   {
          //     backgroundColor: pressed ? theme.color_black : theme.color_fuel,
          //   },
          //   styles.GatheringScheduleSubmit,
          // ]}
        >
          Schedule
        </button>
        <button
          className={styles.GatheringCreateSubmit}
          onClick={() =>
            createRoomFormSubmit({ roomName, gatheringType: activeButton })
          }
          // onPress={startNowHandler}
          // style={({ pressed }) => [
          //   {
          //     backgroundColor: pressed ? theme.color_black : theme.color_fuel,
          //   },
          //   styles.GatheringCreateSubmit,
          // ]}
        >
          Start Now
        </button>
      </div>
    </div>
  );
};

export default GatheringCreate;
