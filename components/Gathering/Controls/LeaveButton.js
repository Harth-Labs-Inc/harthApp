import { IconClose } from "../../../resources/icons/IconClose"
import styles from "./gatheringButtons.module.scss"


export const LeaveButton = (props) => {
    const {
        size = "large",
        onPress,
    } = props;

    return (
        <>
        <button
            className={`
                ${styles.leaveButton} 
                ${size == "large" ? styles.leaveButtonLarge : styles.leaveButtonSmall} 
            `}
            aria-label="Leave Gathering"
            onClick={onPress}
        >
            <div height="100%" width="100%">
                <IconClose />
            </div>
        </button>
        </>
    );
};
