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
                onClick={handleJoinRoom}
                className={styles.ActionBarSubmit}
            >
                {cardType === "schedule" ? "Join" : "Join"}
            </button>
        );
    }
    if (cardType === "schedule" && owner) {
        return null;
    } else {
        return (
            <button
                onClick={handleDropRoom}
                className={` ${styles.ActionBarSubmit} ${styles.ActionBarSubmitActive}`}
            >
                {cardType === "schedule" ? "Drop" : "Leave"}
            </button>
        );
    }
};

export default GatheringTileControls;
