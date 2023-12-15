import styles from "./SetNotifications.module.scss";
/* eslint-disable */
export const SetNotifications = ({
  request,
  refuseNotifcations,
  permissionDenied,
}) => {
  return (
    <div className={styles.MainContainer}>
      <div className={styles.title}>Turn on Notifications</div>

      {permissionDenied ? (
        <p className={styles.error}>
          It looks like your notifications are disabled. <br /> <br />
          Please double check and try again or press don`&apos;`t allow to not
          see this again.
        </p>
      ) : (
        <div className={styles.subtext}>
          Enabling notifications will allow you to recieve alerts when your
          friends post something new
        </div>
      )}

      <div className={styles.actionBar}>
        <button onClick={request}>Enable Notifications</button>

        <button className={styles.cancel} onClick={refuseNotifcations}>
          Don&apos;t Allow
        </button>
      </div>
    </div>
  );
};
