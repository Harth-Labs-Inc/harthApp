import styles from "./SetNotifications.module.scss";

export const SetNotifications = ({
  request,
  refuseNotifcations,
  permissionDenied,
}) => {
  return (
    <div className={styles.MainContainer}>
      <div className={styles.title}>Turn on Notifications</div>

      <div className={styles.subtext}>
        Enabling notifications will allow you to recieve alerts when your
        friends post something new
      </div>
      <p className={styles.subtext} style={{ color: "#d96fab" }}>
        {permissionDenied
          ? "It looks like your notifications are disabled. Please double check and try again or press don't allow to not see this again."
          : null}
      </p>
      <button onClick={request}>Enable Notifications</button>
      <button className={styles.cancel} onClick={refuseNotifcations}>
        Don&apos;t Allow
      </button>
    </div>
  );
};
