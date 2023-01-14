import { useContext, useState, useEffect } from "react";

import { useComms } from "../../../contexts/comms";
import { useAuth } from "../../../contexts/auth";
import { useChat } from "../../../contexts/chat";
import { useSocket } from "../../../contexts/socket";
import { MobileContext } from "../../../contexts/mobile";
import { Modal } from "../../Common";
// import { deleteConversationByID } from "../../../requests/community";
import ConversationDeleteModal from "../ConversationDeleteModal";

import ConversationListElement from "../../Conversation/ConversationListElement";
import { IconAdd } from "../../../resources/icons/IconAdd";

import CreateNewConversationModal from "./CreateNewConversationModal/CreateNewConversationModal";
import styles from "./ConversationsNav.module.scss";

const ConversationsNav = () => {
    const [conversationsArr, setConversationsArr] = useState([]);
    const [openConversationBuilder, setOpenConversationBuilder] =
        useState(false);
    const [showDeleteConversationModal, setShowDeleteConversationModal] =
        useState(false);

    const { isMobile } = useContext(MobileContext);
    const { unreadMsgs, incomingConversation, emitUpdate } = useSocket();
    const { user } = useAuth();
    const {
        conversations,
        setConversation,
        selectedConversation,
        selectedcomm,
    } = useComms();
    const { setSelectedReplyOwner } = useChat();

    useEffect(() => {
        if (conversations) {
            let unhiddenConversations = conversations.filter(({ members }) => {
                let userIndex = members.findIndex(({ user_id }) => {
                    return user_id == user._id;
                });

                let isHidden;

                if (userIndex >= 0) {
                    let profile = members[userIndex];
                    isHidden = profile?.hidden;
                }
                if (!isHidden) {
                    return true;
                }
            });
        }
    }, [conversations]);

    // useEffect(() => {
    //     if (incomingConversation._id) {
    //         setConversationsArr([...conversations, incomingConversation]);
    //     }
    // }, [incomingConversation]);

    // useEffect(() => {
    //     document.addEventListener("contextmenu", (event) => {
    //         event.preventDefault();
    //     });

    //     return () => {
    //         window.removeEventListener("contextmenu", () => {});
    //     };
    // }, []);

    const changeSelectedConversation = (conversation) => {
        setConversation(conversation);
        setSelectedReplyOwner({});
    };
    const openCreateConversation = () => {
        setOpenConversationBuilder(!openConversationBuilder);
    };

    const onDeleteHandler = () => {
        console.log("onDeleteHandler");
        setShowDeleteConversationModal(true);
    };
    const onCloseDeleteModal = () => {
        setShowDeleteConversationModal(false);
    };
    const submitConversationDeleteHandler = async (newConversation) => {
        // await deleteConversationByID(newConversation._id);
        let msg = {};
        msg.updateType = "conversation deleted";
        msg.comm = selectedcomm;
        msg.conversation = newConversation;
        emitUpdate(selectedcomm._id, msg, async (err, status) => {
            if (err) {
                console.log(err);
            }
            setShowDeleteConversationModal(false);
            setOpenEditConversationMenu(null);
        });
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
                <p className={styles.ConversationsNavTitle}>Conversations</p>
                <div className={styles.ConversationsNavContainer}>
                    {conversationsArr &&
                        conversationsArr.map((conversation) => {
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
                            unreadMsgs.forEach((msg) => {
                                if (
                                    msg.conversation_id === conversation._id &&
                                    msg.creator_id !== user._id &&
                                    (selectedConversation || {})._id !==
                                        msg.conversation_id
                                ) {
                                    let owner = conversation?.members.find(
                                        (member) => member?.user_id === user._id
                                    );
                                    if (!owner || !owner.muted) {
                                        hasAlert = true;
                                        alertProfiles.push(msg);
                                    }
                                }
                            });

                            if (conversation?.contentAge == "short") {
                                isShort = true;
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
                                    label={conversation?.title}
                                    toggleConversationEditModal={
                                        toggleConversationEditModal
                                    }
                                />
                            );
                        })}

                    {/* These are placed here to for visual design purposes. 
                        remove when logic is added to pull real conversations */}
                    <ConversationListElement />
                    <ConversationListElement />
                    <div className={styles.ConversationsNavCreate}>
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
                            conversation
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default ConversationsNav;
