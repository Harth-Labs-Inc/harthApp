import styles from "./SetNotifications.module.scss";


export const SetNotifications = (request) => {
  
  return (
    <div className={`${styles.MainContainer}`}>

    <button onClick={request}>Enable Notifications</button>
    </div>
  );
};
