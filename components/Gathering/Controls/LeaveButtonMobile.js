import { IconChevronLeft } from "../../../resources/icons/IconChevronLeft";
import styles from "./gatheringButtons.module.scss";

export const LeaveButtonMobile = (props) => {
    const { onClick, theme } = props;
    return (
        <>
            <button className={styles.leaveButtonMobile} onClick={onClick}>
                <div style={{ height: 24, width: 24 }}>
                    <IconChevronLeft />
                </div>
            </button>
        </>
    );
};

