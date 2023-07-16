import { useEffect, useState } from "react";

import styles from "./UserIcon.module.scss";
import { useComms } from "contexts/comms";
import { useAuth } from "contexts/auth";

const UserIcon = ({
  img,
  name,
  showName = true,
  size = "regular",
  iconClass = "",
  isPressable = false,
  pressHandler,
  shouldIgnoreUserId,
}) => {
  const [dimensions, setDimensions] = useState({ height: 48, width: 48 });

  const { user } = useAuth();

  const { selectedcomm } = useComms();

  useEffect(() => {
    if (size === "small") {
      setDimensions({ height: 36, width: 36 });
    } else {
      setDimensions({ height: 40, width: 40 });
    }
  }, [size]);

  return (
    <>
      {isPressable ? (
        <button
          onClick={pressHandler}
          className={styles.userIconButton}
          aria-label="profile settings"
        >
          <span
            className={`iconWrapper ${styles.userIconWrapper} ${
              size === "small" ? styles.userIconSmall : styles.userIconRegular
            }`}
          >
            <img
              className={`${styles.userIconImage} ${iconClass} ${
                !shouldIgnoreUserId ? `${selectedcomm?._id}_${user?._id}` : ""
              } `}
              src={img ? img : "/images/harth_placeholder.png"}
              alt="profile image"
              loading="eager"
              height={dimensions.height}
              width={dimensions.width}
            />
            {showName ? (
              <span className={styles.userIconName}>{name}</span>
            ) : null}
          </span>
        </button>
      ) : (
        <span
          className={`${styles.userIconWrapper} ${
            size === "small" ? styles.userIconSmall : styles.userIconRegular
          }`}
        >
          <img
            className={`${styles.userIconImage} ${iconClass} ${
              !shouldIgnoreUserId ? `${selectedcomm?._id}_${user?._id}` : ""
            }`}
            src={img ? img : "/images/harth_placeholder.png"}
            alt="profile image"
            loading="eager"
            height={dimensions.height}
            width={dimensions.width}
          />
          {showName ? (
            <span className={styles.userIconName}>{name}</span>
          ) : null}
        </span>
      )}
    </>
  );
};

export default UserIcon;
