// import { Pressable, StyleSheet } from "react-native";

// import { Party, Stream, Voice } from "../../../../icons";
import { IconHeadsetMic } from "../../../resources/icons/IconHeadsetMic";
import { IconCastNoFill } from "../../../resources/icons/IconCastNoFill";
import { IconWorkspace } from "../../../resources/icons/IconWorkspace";

import styles from "./GatheringCreate.module.scss";

export const GatheringButton = (props) => {
    const { type, active = false, activeButtonHandler } = props;

    const Icon = () => {
        if (type === "voice") {
            return <IconHeadsetMic />;
        }
        if (type === "stream") {
            return <IconCastNoFill />;
        }
        if (type === "party") {
            return <IconWorkspace />;
        }
    };

    return (
        <button
            type="button"
            className={`${styles.GatheringButton} ${styles[type]} ${
                active ? styles.Active : null
            }`}
            onClick={() => {
                activeButtonHandler(type);
            }}
        >
            <div className={styles.GatheringButtonIcon}><Icon /></div>
            <div className={styles.text}>{type}</div>

        </button>
    );
};
