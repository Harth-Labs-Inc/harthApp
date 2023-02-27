import { useEffect, useState } from "react";
import Image from "next/image";

import styles from "./UserIcon.module.scss";

const UserIcon = ({ id, img, name, showName = true, size = "regular" }) => {
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
            <span
                className={`${styles.userIconWrapper} ${
                    size === "small"
                        ? styles.userIconSmall
                        : styles.userIconRegular
                }`}
            >
                <Image
                    className={styles.userIconImage}
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
        </>
    );
};

export default UserIcon;
