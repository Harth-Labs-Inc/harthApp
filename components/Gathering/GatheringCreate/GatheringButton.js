import { RoomStream } from "resources/icons/RoomStream";
import { RoomParty } from "resources/icons/RoomParty";
import { RoomVoice } from "resources/icons/RoomVoice";

import styles from "./GatheringCreate.module.scss";

export const GatheringButton = (props) => {
    const { type, active = false, activeButtonHandler } = props;

    const Icon = () => {
        if (type === "voice") {
            return <RoomVoice />;
        }
        if (type === "stream") {
            return <RoomStream />;
        }
        if (type === "party") {
            return <RoomParty />;
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
            <div className={styles.iconHolder} ><Icon /></div>
            <div className={styles.text}>{type}</div>

        </button>
    );
};
