import { Button } from "../../Common";

import styles from "./GatheringTile.module.scss";

const GatheringTileControls = ({
    isInRoom,
    cardType,
    handleJoinRoom,
    handleDropRoom,
}) => {
    console.log("isInRoom", isInRoom);
    if (!isInRoom) {
        return (
            <Button
                text={cardType === "schedule" ? "Join" : "Enter"}
                onClick={handleJoinRoom}
                className={styles.GatheringTileActionButton}
            />
        );
    }
    return (
        <Button
            text={cardType === "schedule" ? "Drop" : "Leave"}
            onClick={handleDropRoom}
            className={styles.GatheringTileActionButton}
        />
    );
};

export default GatheringTileControls;
