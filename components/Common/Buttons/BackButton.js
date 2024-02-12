import { IconChevronLeft } from "../../../resources/icons/IconChevronLeft";
import styles from "./Buttons.module.scss";

export const BackButton = ({ clickHandler }) => {
    return (
        <>
            <button className={styles.backButton} onClick={clickHandler}>
                <IconChevronLeft />
            </button>
        </>
    );
};
