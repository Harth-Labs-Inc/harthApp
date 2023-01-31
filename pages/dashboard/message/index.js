import { useContext, useEffect } from "react";
import { ConversationMessages } from "../../../components/Conversations/ConversationMessages";
import { MobileContext } from "../../../contexts/mobile.js";
import ConversationsNav from "../../../components/Menus/ConversationMenu/ConversationsNav";
import styles from "./messagePage.module.scss";

const Message = () => {
    const { isMobile } = useContext(MobileContext);

    return (
        <>
            {isMobile ? (
                <>
                    <div style={{ width: "100%", position: "relative" }}>
                        <div className={styles.topicHolderMobile}>
                            <ConversationsNav />
                        </div>
                    </div>
                </>
            ) : (
                <>
                    <ConversationsNav />
                    <ConversationMessages />
                </>
            )}
        </>
    );
};

export default Message;
