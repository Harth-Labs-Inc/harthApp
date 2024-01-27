import { memo } from "react";
import styles from "../Party.module.scss";

const PeerContainerComponent = ({ peer }) => {
  if (!peer) {
    return null;
  }

  return (
    <div
      key={peer.socketID}
      id={peer.socketID}
      className={styles.videoContainer}
      style={{ gridArea: `peer${peer.index + 1}` }}
    >
      <>
        <figure>
          <img
            src={peer?.img || peer?.userIcon}
            className={styles.peerImage}
            alt={peer.name || peer?.userName}
          />
        </figure>
        <p className={styles.peerName}>{peer.name || peer?.userName}</p>
      </>
    </div>
  );
};

const PeerContainer = memo(PeerContainerComponent);

export default PeerContainer;
