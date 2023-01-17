import { Button } from "../../Common/Buttons/Button";

import styles from "./GatheringTile.module.scss";

const GatheringTileControls = ({
  isInRoom,
  cardType,
  handleJoinRoom,
  handleDropRoom,
  owner,
}) => {
  console.log("isInRoom", !!isInRoom, `owner: ${owner}`);
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
  if (cardType === "schedule" && owner) {
    return null;
  } else {
    return (
      <Button
        text={cardType === "schedule" ? "Drop" : "Leave"}
        onClick={handleDropRoom}
        tier="secondary"
        //className={styles.GatheringTileActionButtonEnd}
      />
    );
  }
};

export default GatheringTileControls;
