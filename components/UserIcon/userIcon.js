import { useEffect, useState } from "react";

import styles from "./UserIcon.module.scss";

const UserIcon = ({
    img,
    name,
    showName = true,
    size = "regular",
    iconClass = "",
    isPressable = false,
    pressHandler,
}) => {
    const [dimensions, setDimensions] = useState({ height: 48, width: 48 });

    useEffect(() => {
        if (size === "small") {
            setDimensions({ height: 32, width: 32 });
        } else {
            setDimensions({ height: 48, width: 48 });
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
                        className={`${styles.userIconWrapper} ${
                            size === "small"
                                ? styles.userIconSmall
                                : styles.userIconRegular
                        }`}
                    >
                        <img
                            className={`${styles.userIconImage} ${iconClass}`}
                            src={img ? img : "/images/harth_placeholder.png"}
                            alt="profile image"
                            loading="lazy"
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
                        size === "small"
                            ? styles.userIconSmall
                            : styles.userIconRegular
                    }`}
                >
                    <img
                        className={`${styles.userIconImage} ${iconClass}`}
                        src={img ? img : "/images/harth_placeholder.png"}
                        alt="profile image"
                        loading="lazy"
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
