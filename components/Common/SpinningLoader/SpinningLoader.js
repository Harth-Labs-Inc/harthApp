import { useRouter } from "next/router";
import styles from "./Modal.module.scss";
import { memo } from "react";
import { DisplayLogo } from "../DisplayLogo/DisplayLogo";

export const SpinningLoader = memo(({ spinnerOnly, gatherRoom }) => {
  const router = useRouter();
  const { query } = router;

  const Spinner = () => {
    return <div className={styles.spinner} />;
  };

  if (spinnerOnly) {
    return <Spinner />;
  }
  if (gatherRoom) {
    return (
      <div className={`${styles.Maincontainer} ${styles.MaincontainerDark}`}>
        <div className={`${styles.content}`}>
          <p className={`${styles.roomName}`}>
            Joining {query?.room_name || "room"}
          </p>
          <Spinner />
          <div className={styles.message}>
            P2P Audio and Video is an experimental feature. Unexpected glitches
            may occur.
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className={`${styles.Maincontainer}`}>
      <div className={`${styles.content}`}>
        <DisplayLogo />

        <Spinner />
      </div>
    </div>
  );
});

SpinningLoader.displayName = "SpinningLoader";
