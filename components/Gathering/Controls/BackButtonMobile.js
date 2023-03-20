import { IconChevronLeft } from "../../../resources/icons/IconChevronLeft";
import styles from "./gatheringButtons.module.scss";

const BackButtonMobile = (props) => {
    const { onClick } = props;
    return (
        <>
            <button className={styles.controlButtonMobile} onClick={onClick}>
                <div style={{ height: 24, width: 24 }}>
                    <IconChevronLeft />
                </div>
            </button>
        </>
    );
};

export default BackButtonMobile;
