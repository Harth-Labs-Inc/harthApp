import { useContext, useState } from "react";
// import { CSSTransition } from "react-transition-group";
import { useComms } from "../../../contexts/comms";

import TopicsNav from "../../../components/Menus/TopicsMenu/TopicsSideNav";
import MobileChatHeader from "../../../components/Topics/MobileChatHeader/MobileChatHeader";
// import TopicsMenu from "../../../components/TopicsMenu";
import ChatMessages from "../../../components/ChatMessages/ChatMessages";
// import TopicEditPanel from "../../../components/Topics/TopicEditPanel/TopicEditPanel";
// import { useSocket } from "../../../contexts/socket";
// import { useComms } from "../../../contexts/comms";
import { MobileContext } from "../../../contexts/mobile.js";

import styles from "./chatPage.module.scss";

const Chat = () => {
    // const { topicChange } = useComms();
    const { isMobile } = useContext(MobileContext);
    const { selectedTopic } = useComms();
    const [chatVisible, setChatVisible] = useState(false);

    // useEffect(() => {
    //     if (isMobile && topicChange) {
    //         setChatVisible(true);
    //     } else {
    //         setChatVisible(false);
    //     }
    // }, [topicChange]);

    // const toggleEditPanel = () => {
    //     setShowEditPanel(!showEditPanel);
    // };

    // const topicChatClasses = () => {
    //     const classes = [];
    //     if (showEditPanel) {
    //         classes.push("topic-edit-active");
    //     }
    //     if (isMobile && chatVisible) {
    //         classes.push("chatVisible");
    //     }
    //     return classes.join(" ");
    // };

    // const toggleMobileMenu = () => {
    //     setChatVisible((prevState) => !prevState);
    // };

    function handleMobileChat(newValue) {
        setChatVisible(newValue);
    }

    return (
        <>
            {isMobile ? (
                <>
                    {!chatVisible ? (
                        <div style={{ width: "100%", position: "relative" }}>
                            <div className={styles.topicHolderMobile}>
                                <TopicsNav
                                    handleMobileChat={handleMobileChat}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className={styles.chatHolderMobile}>
                            <MobileChatHeader
                                selectedTopic={selectedTopic}
                                handleMobileChat={handleMobileChat}
                                toggleTopicEditModal
                            />
                            <ChatMessages />
                        </div>
                    )}
                </>
            ) : (
                <>
                    <TopicsNav />
                    <ChatMessages />
                </>
            )}
        </>
    );
};

export default Chat;
