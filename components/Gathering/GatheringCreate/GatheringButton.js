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
            return <IconHeadsetMic fill={active ? "#fff" : "#2f1d2a"} />;
        }
        if (type === "stream") {
            return <IconCastNoFill fill={active ? "#fff" : "#2f1d2a"} />;
        }
        if (type === "party") {
            return <IconWorkspace fill={active ? "#fff" : "#2f1d2a"} />;
        }
    };

    return (
        <button
            className={`${styles.GatheringButton} ${styles[type]} ${
                active ? styles.Active : null
            }`}
            onClick={() => activeButtonHandler(type)}
        >
            <Icon />
        </button>
    );
};
