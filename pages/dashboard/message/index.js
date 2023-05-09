import { useContext, useEffect, useState } from "react";
import { IconChevronLeft } from "../../../resources/icons/IconChevronLeft";

import { CustomConversationContextMenu } from "components/CustomConversationContextMenu/CustomConversationContextMenu";
import { ConversationMessages } from "../../../components/Conversations/ConversationMessages";
import { MobileContext } from "../../../contexts/mobile.js";
import { useAuth } from "../../../contexts/auth";
import { useSocket } from "contexts/socket";
import { useComms } from "contexts/comms";
import ConversationsNav from "../../../components/Menus/ConversationMenu/ConversationsNav";
import styles from "./messagePage.module.scss";
import ConversationDeleteModal from "components/Menus/ConversationDeleteModal";
import { saveConversationMessage } from "requests/conversations";
import {
    deleteConversation,
    deleteConversationFinal,
} from "requests/conversations";

const Message = () => {
    const { isMobile } = useContext(MobileContext);
    const { emitUpdate } = useSocket();
    const { selectedcomm, fetchConversations } = useComms();
    const { user } = useAuth();
    const [openEditConversationMenu, setOpenEditConversationMenu] =
        useState(false);
    const [showLeaveConversationModal, setShowLeaveConversationModal] =
        useState(false);
    const [chatVisible, setChatVisible] = useState(false);

    useEffect(() => {
        const element = document.getElementById("mainmessageContainer");
        element.classList.add(styles.rendering);
        setTimeout(() => {
            element.classList.remove(styles.rendering);
            element.classList.add(styles.entered);
        }, 100);

        return () => {
            element.classList.remove(styles.entered);
            element.classList.remove(styles.rendering);
        };
    }, []);

    const toggleConversationEditModal = ({ conversation, pos }) => {
        setOpenEditConversationMenu({ conversation, pos });
    };

    const closeConversationEditModal = () => {
        if (!showLeaveConversationModal) {
            setOpenEditConversationMenu(false);
        }
    };

    const onLeaveHandler = () => {
        setShowLeaveConversationModal(true);
    };

    const submitDeleteConversation = async () => {
        let numOfUsers = openEditConversationMenu?.conversation?.users?.length;

        if (numOfUsers >= 2) {
            await deleteConversation({
                conversation: openEditConversationMenu.conversation,
                user,
            });
            let creator = openEditConversationMenu.conversation.users?.find(
                (usr) => usr.userId === user?._id
            );
            let ids = openEditConversationMenu.conversation.users?.map(
                (usr) => usr.userId
            );
            let newMessage = {
                creator_type: "Admin",
                creator_id: "",
                creator_name: "",
                creator_image: "",
                comm_id: selectedcomm?._id,
                bookmarked: false,
                date: new Date(),
                message: `${creator.name} has left the conversation`,
                reactions: [],
                attachments: [],
                userIDS: ids,
                conversation_id: openEditConversationMenu.conversation._id,
            };
            const data = await saveConversationMessage(newMessage);

            let { id, ok } = data;
            if (ok) {
                if (id) {
                    newMessage._id = id;
                }

                fetchConversations();
                broadcastMessage(newMessage);
                setShowLeaveConversationModal(false);
                setOpenEditConversationMenu(false);
            }
        } else {
            await deleteConversationFinal({
                conversation: openEditConversationMenu.conversation,
            });

            fetchConversations();
            setShowLeaveConversationModal(false);
            setOpenEditConversationMenu(false);
        }
    };

    const broadcastMessage = (message) => {
        message.updateType = "new conversation message";
        emitUpdate(selectedcomm?._id, message, async (err) => {
            if (err) {
                console.error(err);
            }
        });
    };
    function handleMobileChat(newValue) {
        setChatVisible(newValue);
    }
    const handleBackToNav = () => {
        handleMobileChat(false);
    };
    return (
        <>
            {isMobile ? (
                <>
                    {!chatVisible ? (
                        <div
                            id="mainmessageContainer"
                            style={{ width: "100%", position: "relative" }}
                        >
                            <div className={styles.topicHolderMobile}>
                                <ConversationsNav
                                    handleMobileChat={handleMobileChat}
                                />
                            </div>
                        </div>
                    ) : (
                        <div
                            id="mainchatContainer"
                            className={styles.chatHolderMobile}
                        >
                            <div className={styles.MobileChatHeader}>
                                <button
                                    onClick={handleBackToNav}
                                    aria-label="back"
                                >
                                    <IconChevronLeft />
                                </button>
                            </div>
                            <ConversationMessages />
                        </div>
                    )}
                </>
            ) : (
                <div
                    id="mainmessageContainer"
                    className={styles.ConversationMessages}
                >
                    {openEditConversationMenu ? (
                        <CustomConversationContextMenu
                            harth={openEditConversationMenu.harth}
                            pos={openEditConversationMenu.pos}
                            closeModal={closeConversationEditModal}
                            onLeaveHandler={onLeaveHandler}
                        />
                    ) : null}
                    {showLeaveConversationModal ? (
                        <ConversationDeleteModal
                            setHidden={() =>
                                setShowLeaveConversationModal(false)
                            }
                            submitDeleteConversation={submitDeleteConversation}
                            conversation={openEditConversationMenu.conversation}
                        />
                    ) : null}
                    <ConversationsNav
                        toggleConversationEditModal={
                            toggleConversationEditModal
                        }
                    />
                    <ConversationMessages />
                </div>
            )}
        </>
    );
};

export default Message;
