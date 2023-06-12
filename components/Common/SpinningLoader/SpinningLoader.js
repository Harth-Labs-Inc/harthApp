import { useRouter } from "next/router";
import styles from "./Modal.module.scss";
import { HarthLogoDark } from "public/images/harth-logo-dark";

export const SpinningLoader = () => {
  const router = useRouter();
  const { query } = router;

  const Spinner = () => {
    return (
      <div className={styles.loader}>
        <div className={styles.bar} />
      </div>);
  };

  if (query.gather_window) {
    return (
      <div className={`${styles.Maincontainer} ${styles.MaincontainerDark}`}>
        <div className={`${styles.content}`}>
          <p style={{ color: "white" }}>{query?.room_name}</p>
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
};
