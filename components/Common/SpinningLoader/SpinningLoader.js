import { useRouter } from "next/router";
import styles from "./Modal.module.scss";
import { HarthLogoDark } from "public/images/harth-logo-dark";

export const SpinningLoader = (props) => {
  const router = useRouter();
  const { query } = router;
  const { isDark } = props;


  const Spinner = () => {
    return (
      <div className={styles.loadingDots}>
        
        {isDark ? (
          <img
              src="/images/dotsDark.gif"
              alt="loading"
              loading="lazy"
              />
          ) : (
          <img
            src="/images/dotsLight.gif"
            alt="loading"
            loading="lazy"
            />
        )}
      </div>
    );
  };

  if (query.gather_window) {
    return (
      <div className={`${styles.Maincontainer} ${styles.MaincontainerDark}`}>
        <div className={styles.content}>
          <p>{query?.room_name}</p>
          <Spinner />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.Maincontainer}>
      <div className={styles.content}>
        <div className={styles.logo}><HarthLogoDark /></div>
        <Spinner />
      </div>
    </div>
  );
};
