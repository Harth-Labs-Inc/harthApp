import { Button, Input } from "../../Common";

import styles from "./GatheringCreate.module.scss";

const GatheringCreate = () => {
    return (
        <div style={styles.GatheringCreate}>
            <div style={styles.GatheringCreateSetup}>
                <Input
                    placeholder="Profile Name's Room"
                    onChange={roomNameHandler}
                    isError={isSubmitting ? !roomName.VALID : false}
                    error={roomName.ERROR}
                    value={roomName.VALUE}
                    style={styles.input}
                />
                <div style={styles.GatheringCreateType}>
                    <GatheringButton
                        type="voice"
                        activeButtonHandler={activeButtonHandler}
                        active={activeButton == "voice"}
                    />
                    <GatheringButton
                        type="stream"
                        activeButtonHandler={activeButtonHandler}
                        active={activeButton == "stream"}
                    />
                    <GatheringButton
                        type="party"
                        activeButtonHandler={activeButtonHandler}
                        active={activeButton == "party"}
                    />
                </div>
                {activeButton == "voice" && (
                    <p style={styles.GatheringSubText}>Voice and text chat</p>
                )}
                {activeButton == "stream" && (
                    <p style={styles.GatheringSubText}>
                        Stream games and video
                    </p>
                )}
                {activeButton == "party" && (
                    <p style={styles.GatheringSubText}>
                        Video chat and tabletop play
                    </p>
                )}
                {/* <AppText>{isSubmitting && !activeButton ? "button required" : null}</AppText> */}
            </div>
            <div style={styles.GatheringCreateLaunch}>
                <Button
                    text="Schedule"
                    // style={({ pressed }) => [
                    //   {
                    //     backgroundColor: pressed ? theme.color_black : theme.color_fuel,
                    //   },
                    //   styles.GatheringScheduleSubmit,
                    // ]}
                />
                <Button
                    text="Start Now"
                    // onPress={startNowHandler}
                    // style={({ pressed }) => [
                    //   {
                    //     backgroundColor: pressed ? theme.color_black : theme.color_fuel,
                    //   },
                    //   styles.GatheringCreateSubmit,
                    // ]}
                />
            </div>
        </div>
    );
};

export default GatheringCreate;
