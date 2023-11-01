import { useRouter } from "next/router";
import styles from "./Modal.module.scss";
import { HarthLogoDark } from "public/images/harth-logo-dark";
import { memo } from "react";

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
            {query?.room_name}
          </p>
          <Spinner />
        </div>
      </div>
    );
  }
  return (
    <div className={`${styles.Maincontainer}`}>
      <div className={`${styles.content}`}>
        <HarthLogoDark />

        <Spinner />
      </div>
    </div>
  );
});

SpinningLoader.displayName = "SpinningLoader";
