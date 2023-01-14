import { Button } from "../../Common/Buttons/Button";

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
                tier="primary"
                //className={styles.GatheringTileActionButton}
            />
        );
    }
    return (
        <Button
            text={cardType === "schedule" ? "Drop" : "Leave"}
            onClick={handleDropRoom}
            tier="secondary"
            //className={styles.GatheringTileActionButtonEnd}
        />
    );
};

export default GatheringTileControls;
