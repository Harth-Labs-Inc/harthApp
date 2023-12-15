import styles from "./LoadingScreen.module.scss";
import { useContext } from "react";
import { MobileContext } from "contexts/mobile";

export const LoadingScreen = ({ type }) => {
  const { isMobile } = useContext(MobileContext);

  if (type == "topics") {
    return (
      <div className={styles.loaderParent}>
        <div className={isMobile ? styles.MobileTopic : styles.DesktopTopic}>
          <div className={styles.topic}></div>
          <div className={styles.topic}></div>
          <div className={styles.topic}></div>
          <div className={styles.topic}></div>
          <div className={styles.topic}></div>
          <div className={styles.topic}></div>
          <div className={styles.topic}></div>
        </div>
      </div>
    );
  }

  if (type == "message") {
    return (
      <div className={styles.loaderParent}>
        <div
          className={isMobile ? styles.MobileMessage : styles.DesktopMessage}
        >
          <div className={styles.message}></div>
          <div className={styles.message}></div>
          <div className={styles.message}></div>
          <div className={styles.message}></div>
          <div className={styles.message}></div>
          <div className={styles.message}></div>
        </div>
      </div>
    );
  }
  return null;
};
