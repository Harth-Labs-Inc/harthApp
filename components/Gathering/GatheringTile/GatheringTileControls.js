import styles from "./GatheringTile.module.scss";

const GatheringTileControls = ({
    isInRoom,
    cardType,
    handleJoinRoom,
    handleDropRoom,
    owner,
}) => {
    if (!isInRoom) {
        return (
            <button
                //text={cardType === "schedule" ? "Join" : "Enter"}
                onClick={handleJoinRoom}
                //tier="primary"
                className={styles.GatheringTileActionBarSubmit}
            >
                {cardType === "schedule" ? "Join" : "Enter"}
            </button>
        );
    }
    if (cardType === "schedule" && owner) {
        return null;
    } else {
        return (
            <button
                // text={cardType === "schedule" ? "Drop" : "Leave"}
                onClick={handleDropRoom}
                //tier="secondary"
                className={` ${styles.GatheringTileActionBarSubmit} ${styles.GatheringTileActionBarSubmitActive}`}
            >
                {cardType === "schedule" ? "Drop" : "Leave"}
            </button>
        );
    }
};

export default GatheringTileControls;
