import { Button } from "../../Common";

import styles from "./GatheringTile.module.scss";

const GatheringTileControls = ({ isInRoom, cardType, handleJoinRoom }) => {
    if (!isInRoom) {
        return (
            <Button
                text={cardType === "schedule" ? "Join" : "Enter"}
                onPress={handleJoinRoom}
                className={styles.GatheringTileActionButton}
            />
        );
    }
    return (
        <Button
            text={cardType === "schedule" ? "Drop" : "Leave"}
            onPress={handleJoinRoom}
            className={styles.GatheringTileActionButton}
        />
    );
};

export default GatheringTileControls;
