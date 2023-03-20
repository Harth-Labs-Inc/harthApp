import { BackButtonMobile } from "../Controls/BackButtonMobile";

import styles from "./gatherHeader.module.scss";

const GatherChatHeader = () => {
    const goBack = () => {
        //return to previous page
    };

    return (
        <>
            <div className={styles.chatHeader}>
                <BackButtonMobile onClick={goBack} />
                gathering chat
                <div className={styles.rightSpacer} />
            </div>
        </>
    );
};

export default GatherChatHeader;
