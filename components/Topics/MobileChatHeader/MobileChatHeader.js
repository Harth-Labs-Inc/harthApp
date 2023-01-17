import { IconMoreDots } from "../../../resources/icons/IconMoreDots";
import { IconChevronLeft } from "../../../resources/icons/IconChevronLeft";

import styles from "./MobileChatHeader.module.scss";

const MobileChatHeader = ({ handleMobileChat }) => {
    const handleBackToNav = () => {
        handleMobileChat(false);
    };

    return (
        <div class={styles.MobileChatHeader}>
            <button onClick={handleBackToNav} aria-label="back">
                <IconChevronLeft />
            </button>
            <p>Topic Title</p>
            <button aria-label="topic menu">
                <IconMoreDots />
            </button>
        </div>
    );
};

export default MobileChatHeader;
