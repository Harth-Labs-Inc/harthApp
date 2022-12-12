import { IconClose } from "../../../resources/icons/IconClose";
import styles from "./Buttons.module.scss";

const CloseButton = (props) => {
    const { onClick } = props;
    return (
        <>
            <button className={styles.closeButton} onClick={onClick}>
                <div style={{ height: 24, width: 24 }}>
                    <IconClose />
                </div>
            </button>
        </>
    )
}

export default CloseButton



