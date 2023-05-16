import { useContext, useState, useEffect } from "react";
import { useComms } from "../../../contexts/comms";
// import { useAuth } from "../../../contexts/auth";
// import { useSocket } from "../../../contexts/socket";
import { MobileContext } from "../../../contexts/mobile";
import { Modal } from "../../Common";
import ConversationDeleteModal from "../ConversationDeleteModal";
import ConversationListElement from "../../Conversation/ConversationListElement";
import { IconAdd } from "../../../resources/icons/IconAdd";
import CreateNewConversationModal from "./CreateNewConversationModal/CreateNewConversationModal";
import styles from "./ConversationsNav.module.scss";

/* eslint-disable */

const ConversationsNav = ({
    toggleConversationEditModal,
    handleMobileChat,
}) => {
    const [openConversationBuilder, setOpenConversationBuilder] =
        useState(false);
    const [showDeleteConversationModal, setShowDeleteConversationModal] =
        useState(false);

    const { isMobile } = useContext(MobileContext);
    // const { incomingConversation, emitUpdate } = useSocket();
    // const { user } = useAuth();
    const { conversations, selectedConversation, setSelectedConversation } =
        useComms();

    useEffect(() => {}, [conversations]);

    const openCreateConversation = () => {
        setOpenConversationBuilder((prevState) => !prevState);
    };
    const handleMobileChatWindow = (newValue) => {
        handleMobileChat(newValue);
    };
    const changeSelectedConversation = (conversation) => {
        setSelectedConversation(conversation);
        {
            isMobile && handleMobileChatWindow(conversation);
        }
    };

    return (
        <>
            {openConversationBuilder && (
                <CreateNewConversationModal
                    toggleModal={openCreateConversation}
                />
            )}

            {showDeleteConversationModal ? (
                <Modal onToggleModal={() => {}}>
                    <ConversationDeleteModal
                        submitConversationChange={
                            submitConversationDeleteHandler
                        }
                        hidden={!showDeleteConversationModal}
                        setHidden={onCloseDeleteModal}
                        conversation={{
                            ...(openEditConversationMenu?.conversation || {}),
                        }}
                    />
                </Modal>
            ) : null}

            <aside
                className={`
                ${styles.ConversationsNav}
                ${isMobile && styles.ConversationsNavMobile}
                `}
            >
                <p
                    className={
                        isMobile
                            ? styles.ConversationsNavTitleMobile
                            : styles.ConversationsNavTitle
                    }
                >
                    Conversations
                </p>
                <div className={styles.ConversationsNavContainer}>
                    {conversations &&
                        conversations.map((conversation) => {
                            let isActive = false;
                            let isShort = false;
                            let hasAlert = false;
                            let alertProfiles = [];
                            if (
                                (selectedConversation || {})._id ==
                                (conversation || {})._id
                            ) {
                                isActive = true;
                            }

                            return (
                                <ConversationListElement
                                    clickHandler={changeSelectedConversation}
                                    key={conversation._id}
                                    conversation={conversation}
                                    isMobile={isMobile}
                                    hasAlert={hasAlert}
                                    alertProfiles={alertProfiles}
                                    isActive={isActive}
                                    isShort={isShort}
                                    label={conversation?.name}
                                    toggleConversationEditModal={
                                        toggleConversationEditModal
                                    }
                                />
                            );
                        })}

                    <div
                        className={
                            isMobile
                                ? styles.ConversationsNavCreateMobile
                                : styles.ConversationsNavCreate
                        }
                    >
                        <button
                            className={
                                isMobile
                                    ? styles.ConversationsNavCreateMobileButton
                                    : styles.ConversationsNavCreateButton
                            }
                            id="create_conversation"
                            onClick={openCreateConversation}
                        >
                            <div className={styles.iconHolder}>
                                <IconAdd />
                            </div>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default ConversationsNav;
