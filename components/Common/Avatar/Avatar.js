import { IconAccountNoFill } from "../../../resources/icons/IconAccountNoFill";

import styles from "./avatar.module.scss";

export const Avatar = (props) => {
    const {
        isPressable = false,
        pressHandler,
        picSize = 40,
        imageSrc,
        aLabel = "Profile Image",
        darkBackground = false,
        customStyle,
    } = props;

    return (
        <>
            {isPressable ? (
                <button
                    onClick={pressHandler}
                    className={`
                            ${styles.Avatar} 
                            ${styles.AvatarButton}
                            ${darkBackground && styles.AvatarDark}
                            `}
                    style={{ zIndex: customStyle }}
                    aria-label={aLabel}
                >
                    {imageSrc & (imageSrc != "undefined") ? (
                        <img
                            src={imageSrc}
                            aria-label="Profile Image"
                            className={styles.AvatarImage}
                            height={picSize}
                            width={picSize}
                        />
                    ) : (
                        <span className={styles.AvatarImage}>
                            <IconAccountNoFill
                                fill={darkBackground ? "#fff" : "#2f1d2a"}
                            />
                        </span>
                    )}
                </button>
            ) : (
                <div className={styles.Avatar} style={{ zIndex: customStyle }}>
                    {imageSrc & (imageSrc != "undefined") ? (
                        <img
                            src={imageSrc}
                            aria-label="Profile Image"
                            className={styles.AvatarImage}
                            height={picSize}
                            width={picSize}
                        />
                    ) : (
                        <span className={styles.AvatarImage}>
                            <IconAccountNoFill
                                fill={darkBackground ? "#fff" : "#2f1d2a"}
                            />
                        </span>
                    )}
                </div>
            )}
        </>
    );
};
