import { IconChevronLeft } from "../../../resources/icons/IconChevronLeft";
import styles from "./Buttons.module.scss";

const BackButton = (props) => {
    const { onClick } = props;
    return (
        <>
            <button className={styles.backButton} onClick={onClick}>
                <div style={{ height: 24, width: 24 }}>
                    <IconChevronLeft />
                </div>
            </button>
        </>
    );
};

export default BackButton;
