import { IconPresentFill } from "../../../resources/icons/IconPresentFill";
import { IconCancelCastFill } from "../../../resources/icons/IconCancelCastFill";
import styles from "./gatheringButtonsStream.module.scss";

export const StreamButtonStream = (props) => {
    const { isMobile = false, onPress, isOn } = props;

    return (
        <button
            className={`
                ${styles.basicButton} 
                ${isMobile ? styles.basicButtonMobile : styles.basicButtonDesktop} 
                ${isOn ? styles.basicButtonActive : styles.basicButtonInactive}
                ${styles.streamButton}
            `}
            aria-label="Stream"
            onClick={onPress}
        >
            {isOn ? (
                <div height="100%" width="100%">
                    <IconCancelCastFill hasGradient="true" />
                </div>
            ) : (
                <div height="100%" width="100%" className={styles.defaultIcon}>
                    <IconPresentFill hasGradient={false} />
                </div>
            )}
        </button>
    );
};
