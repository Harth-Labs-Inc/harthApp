import { IconChevronLeft } from "../../../resources/icons/IconChevronLeft";
import styles from "./Buttons.module.scss";

export const BackButton = ({ clickHandler }) => {
    return (
        <>
            <button className={styles.backButton} onClick={clickHandler}>
                <div style={{ height: 24, width: 24 }}>
                    <IconChevronLeft />
                </div>
            </button>
        </>
    );
};
