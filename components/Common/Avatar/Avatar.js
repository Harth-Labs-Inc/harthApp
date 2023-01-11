import styles from "./avatar.module.scss";

export const Avatar = (props) => {
    const {
        isPressable = false,
        pressHandler,
        picSize = 40,
        imageSrc,
        aLabel = "Profile Image",
        darkBackground = false,
    } = props;

    console.log(isPressable);

    return (
        <>
            {isPressable ? (
                <button
                    onClick={pressHandler}
                    className={`
                            ${styles.avatarButton} 
                            ${darkBackground && styles.avatarButtonDark}
                            `}
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
                        src={
                            imageSrc
                                ? imageSrc
                                : "https://media.istockphoto.com/id/1300845620/vector/user-icon-flat-isolated-on-white-background-user-symbol-vector-illustration.jpg?s=612x612&w=0&k=20&c=yBeyba0hUkh14_jgv1OKqIH0CCSWU_4ckRkAoy2p73o="
                        }
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
