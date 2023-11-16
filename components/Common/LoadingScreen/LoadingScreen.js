import styles from "./LoadingScreen.module.scss";

/* eslint-disable */
export const LoadingScreen = (props) => {
  const {
    type,
  } = props;

  if (type == "topics") {

    return (

        <div className={isMobile ? styles.MobileTopic : styles.DesktopTopic}>
            <div className={styles.topic}></div>
            <div className={styles.topic}></div>
            <div className={styles.topic}></div>
            <div className={styles.topic}></div>
            <div className={styles.topic}></div>
            <div className={styles.topic}></div>
            <div className={styles.topic}></div>
        </div>
    );
  }

  if (type == "message") {

    return (

        <div className={isMobile ? styles.MobileMessage : styles.DesktopMessage}>
            <div className={styles.message}></div>
            <div className={styles.message}></div>
            <div className={styles.message}></div>
            <div className={styles.message}></div>
            <div className={styles.message}></div>
            <div className={styles.message}></div>
        </div>
    );
  }
};
