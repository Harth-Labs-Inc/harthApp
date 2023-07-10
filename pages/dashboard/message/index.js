import { useContext, useState } from "react";
import { IconChevronLeft } from "../../../resources/icons/IconChevronLeft";
import { IconMoreDots } from "../../../resources/icons/IconMoreDots";
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
import { CSSTransition, TransitionGroup } from "react-transition-group";

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
          <div
            id="mainmessageContainer"
            style={{ width: "100%", position: "relative" }}
          >
            <div className={styles.topicHolderMobile}>
              <ConversationsNav handleMobileChat={handleMobileChat} />
            </div>
          </div>
          <TransitionGroup>
            <CSSTransition
              key={chatVisible ? "chat" : "topics"}
              timeout={300}
              classNames="slide"
            >
              {chatVisible ? (
                <div id="mainchatContainer" className={styles.chatHolderMobile}>
                  <div className={styles.MobileChatHeader}>
                    <button onClick={handleBackToNav} aria-label="back">
                      <IconChevronLeft />
                    </button>
                    <div className={styles.people}>
                      {chatVisible?.OriginalUsers && (
                        <>
                          {chatVisible?.OriginalUsers.map((e) => {
                            if (e.userId !== user._id) {
                              return (
                                <>
                                  <img
                                    key={e.userId}
                                    className={`
                                                                        ${styles.avatar} 
                                                                        ${styles.avatarMobile} 
                                                                        ${selectedcomm?._id}_${e.userId}
                                                                        `}
                                    src={e.iconKey}
                                    loading="lazy"
                                  />
                                </>
                              );
                            }
                            return null;
                          })}
                        </>
                      )}
                    </div>
                    <button aria-label="conversation menu">
                      <IconMoreDots />
                    </button>
                  </div>
                  <ConversationMessages />
                </div>
              ) : (
                <></>
              )}
            </CSSTransition>
          </TransitionGroup>
        </>
      ) : (
        <div id="mainmessageContainer" className={styles.ConversationMessages}>
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
              setHidden={() => setShowLeaveConversationModal(false)}
              submitDeleteConversation={submitDeleteConversation}
              conversation={openEditConversationMenu.conversation}
            />
          ) : null}
          <ConversationsNav
            toggleConversationEditModal={toggleConversationEditModal}
          />
          <ConversationMessages />
        </div>
      )}
    </>
  );
};

export default Message;
