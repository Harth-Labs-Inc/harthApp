import { IconPower } from "../../../resources/icons/IconPower";
import styles from "./gatheringButtons.module.scss";

export const LeaveButtonMobile = (props) => {
    const { onClick } = props;
    return (
        <>
            <button className={styles.leaveButtonMobile} onClick={onClick}>
                <div height="100%" width="100%">
                    <IconPower />
                </div>
            </button>
        </>
    );
};

