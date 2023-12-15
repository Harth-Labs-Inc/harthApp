import { IconHangUp } from "resources/icons/IconHangUp";
import styles from "./gatheringButtonsStream.module.scss";

export const LeaveButtonStream = (props) => {
    const { isMobile = false, onPress } = props;

    return (
        <>
            <button
                className={`
                ${styles.basicButton} 
                ${isMobile ? styles.basicButtonMobile : styles.basicButtonDesktop} 
                ${styles.leaveButton} 
                ${styles.basicButtonInactive}
            `}
                aria-label="Leave Gathering"
                onClick={onPress}
            >
                <div height="100%" width="100%" className={styles.defaultIcon}>
                    <IconHangUp />
                </div>
            </button>
        </>
    );
};
