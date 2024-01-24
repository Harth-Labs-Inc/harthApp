import { memo } from "react";
import styles from "../Party.module.scss";

const PeerContainerComponent = ({ peer, videoStream }) => {
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
      {videoStream ? (
        <video
          className="video"
          autoPlay
          muted
          playsInline
          ref={(el) => el && (el.srcObject = videoStream)}
        />
      ) : (
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
      )}
    </div>
  );
};

const PeerContainer = memo(PeerContainerComponent);

export default PeerContainer;
