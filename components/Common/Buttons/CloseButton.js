import { useContext } from "react";
import { MobileContext } from "../../../contexts/mobile";
import { IconClose } from "../../../resources/icons/IconClose";

import styles from "./Buttons.module.scss";

export const CloseButton = (props) => {
    const { onClick } = props;
    const { isMobile } = useContext(MobileContext);
    return (
        <>
            <button className={`
                ${styles.closeButton}
                ${isMobile ? styles.closeButtonMobile : styles.closeButtonDesktop}
            `} onClick={onClick}>
                <div >
                    <IconClose />
                </div>
            </button>
        </>
    );
};
