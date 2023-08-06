import styles from "./SetNotifications.module.scss";


export const SetNotifications = ({request}) => {
  
  return (
    <div className={styles.MainContainer}>
      <div className={styles.title}>
        Turn on Notifications
      </div>

      <div className={styles.subtext}>
        Enabling notifications will allow you to recieve alerts when your friends post something new
      </div>

      <button onClick={request}>Enable Notifications</button>
      <button className={styles.cancel}>Don't Allow</button>
    </div>
  );
};
