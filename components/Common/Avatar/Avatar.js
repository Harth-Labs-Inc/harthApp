import { IconAccountNoFill } from "../../../resources/icons/IconAccountNoFill";

import styles from "./avatar.module.scss";

export const Avatar = (props) => {
    const {
        key,
        isPressable = false,
        pressHandler,
        picSize = 40,
        imageSrc,
        aLabel = "Profile Image",
        darkBackground = false,
        customStyle,
        faded = false,
    } = props;

    console.log(imageSrc);

    return (
        <>
            {isPressable ? (
                <button
                    key={key}
                    onClick={pressHandler}
                    className={`
                            ${styles.Avatar} 
                            ${styles.AvatarButton}
                            ${darkBackground && styles.AvatarDark}
                            ${faded && styles.Faded}
                            `}
                    style={{ zIndex: customStyle }}
                    aria-label={aLabel}
                >
                    {imageSrc && imageSrc != "undefined" ? (
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
                <div
                    key={key}
                    className={styles.Avatar}
                    style={{ zIndex: customStyle, opacity: faded ? ".5" : "1" }}
                >
                    {imageSrc && imageSrc != "undefined" ? (
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
