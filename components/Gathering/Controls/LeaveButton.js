import { IconPower } from "../../../resources/icons/IconPower";
import styles from "./gatheringButtons.module.scss";


export const LeaveButton = (props) => {
    const {
        isMobile = false,
        onPress,
    } = props;

    return (
        <>
        <button
            className={`
                ${styles.basicButton} 
                ${isMobile
                    ? styles.basicButtonLarge
                    : styles.basicButtonSmall
                } 
                ${styles.leaveButton} 
                ${styles.basicButtonInactive}
            `}
            aria-label="Leave Gathering"
            onClick={onPress}
        >
            <div height="100%" width="100%">
                <IconPower />
            </div>
        </button>
        </>
    );
};
