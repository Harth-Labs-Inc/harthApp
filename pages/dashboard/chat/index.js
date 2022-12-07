import { useContext, useState, useEffect } from "react";
import { CSSTransition } from "react-transition-group";

import TopicsSideNav from "../../../components/TopicsSideNav";
import TopicsMenu from "../../../components/TopicsMenu";
import ChatMessages from "../../../components/ChatMessages/ChatMessages";
import TopicEditPanel from "../../../components/Topics/TopicEditPanel/TopicEditPanel";
import { useSocket } from "../../../contexts/socket";
import { useComms } from "../../../contexts/comms";
import { MobileContext } from "../../../contexts/mobile.js";

const Chat = (prop) => {
    const { topicChange } = useComms();
    const { isMobile } = useContext(MobileContext);
    const [showEditPanel, setShowEditPanel] = useState(false);
    const [chatVisible, setChatVisible] = useState(false);

    useEffect(() => {
        if (isMobile && topicChange) {
            setChatVisible(true);
        } else {
            setChatVisible(false);
        }
    }, [topicChange]);

    const toggleEditPanel = () => {
        setShowEditPanel(!showEditPanel);
    };

    const topicChatClasses = () => {
        const classes = [];
        if (showEditPanel) {
            classes.push("topic-edit-active");
        }
        if (isMobile && chatVisible) {
            classes.push("chatVisible");
        }
        return classes.join(" ");
    };

    const toggleMobileMenu = () => {
        setChatVisible((prevState) => !prevState);
    };

    const TopicPanel = () => {
        return showEditPanel ? (
            <TopicEditPanel togglePanel={toggleEditPanel} />
        ) : null;
    };

    return (
        <>
            {isMobile ? null : <TopicsSideNav />}
            <section id="topic_active" className={topicChatClasses()}>
                <TopicsMenu
                    on_toggle_panel={toggleEditPanel}
                    toggleMobileMenu={toggleMobileMenu}
                />

                <div id="topic_messages_container">
                    <ChatMessages />
                </div>
            </section>
            <CSSTransition
                in={showEditPanel}
                timeout={0}
                classNames="topicPanelAnimation"
            >
                <TopicPanel />
            </CSSTransition>
        </>
    );
};

export default Chat;
