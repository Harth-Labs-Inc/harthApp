import styles from "./avatar.module.scss";

export const Avatar = (props) => {
    const {
        isPressable,
        pressHandler,
        picSize = 40,
        imageSrc,
        aLabel = "Profile Image",
    } = props;

    return (
        <>
            {isPressable ? (
                <button
                    onClick={pressHandler}
                    className={styles.avatarButton}
                    aria-label={aLabel}
                >
                    <img
                        src={imageSrc}
                        aria-label="Profile Image"
                        className={styles.avatar}
                        height={picSize}
                        width={picSize}
                    />
                </button>
            ) : (
                <div className={styles.avatarIndicator}>
                    <img
                        src={imageSrc}
                        aria-label="Profile Image"
                        className={styles.avatar}
                        height={picSize}
                        width={picSize}
                    />
                </div>
            )}
        </>
    );
};
