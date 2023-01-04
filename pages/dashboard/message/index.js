import { useContext, useState, useEffect } from "react";

import ChatMessages from "../../../components/ChatMessages/ChatMessages";
import { useSocket } from "../../../contexts/socket";
import { useComms } from "../../../contexts/comms";
import { MobileContext } from "../../../contexts/mobile.js";
import ConversationsNav from "../../../components/Menus/ConversationMenu/ConversationsNav";



import styles from './messagePage.module.scss';

const Message = (prop) => {
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


    return (
        <>
            {isMobile ? (
                <>
                <div style={{width: "100%", position:"relative"}}>
                <div className={styles.topicHolderMobile}>
                    <ConversationsNav />
                </div>
                {/* <div className={styles.chatHolderMobile}>
                    <ChatMessages />
                </div> */}
                </div>
                </>
            ) : (

                <>
                <ConversationsNav />
                <ChatMessages />
                </>

                // <TopicsMenu
                //         on_toggle_panel={toggleEditPanel}
                //         toggleMobileMenu={toggleMobileMenu}
                //     />
            )
            
            
            }

            {/* <CSSTransition
                in={showEditPanel}
                timeout={0}
                classNames="topicPanelAnimation"
            >
                <TopicPanel />
            </CSSTransition> */}
        </>
    );
};

export default Message;
