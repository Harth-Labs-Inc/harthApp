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
import { saveConversationMessage } from "requests/conversations";
import {
  deleteConversation,
  deleteConversationFinal,
} from "requests/conversations";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import { CustomConvContextMenu } from "components/CustomConvContextMenu/CustomConvContextMenu";

const Message = () => {
  const { isMobile } = useContext(MobileContext);
  const { emitUpdate } = useSocket();
  const { selectedcomm, fetchConversations, setSelectedConversation } =
    useComms();
  const { user } = useAuth();
  const [openEditConversationMenu, setOpenEditConversationMenu] =
    useState(false);
  const [chatVisible, setChatVisible] = useState(false);
  const [showMobileConvMenu, setShowMobileConvMenu] = useState(false);

  const toggleConversationEditModal = ({ conversation, pos }) => {
    setOpenEditConversationMenu({ conversation, pos });
  };
  const closeConversationEditModal = () => {
    setOpenEditConversationMenu(false);
  };

  const submitDeleteConversation = async (conv) => {
    let conversation = openEditConversationMenu?.conversation || conv;
    let numOfUsers = conversation?.users?.length;
    if (numOfUsers >= 2) {
      await deleteConversation({
        conversation: conversation,
        user,
      });
      let creator = conversation?.users?.find(
        (usr) => usr.userId === user?._id
      );
      let ids = conversation?.users?.map((usr) => usr.userId);
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
        conversation_id: conversation._id,
      };
      const data = await saveConversationMessage(newMessage);

      let { id, ok } = data;
      if (ok) {
        if (id) {
          newMessage._id = id;
        }

        fetchConversations(selectedcomm?._id);
        broadcastMessage(newMessage);
        setOpenEditConversationMenu(false);
      }
    } else {
      await deleteConversationFinal({
        conversation: conversation,
      });

      fetchConversations(selectedcomm?._id);
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
    if (isMobile) {
      setSelectedConversation(null);
    }
    handleMobileChat(false);
  };
  const handleMobileEditConvMenu = () => {
    setShowMobileConvMenu(true);
  };
  const mobileLeaveConvHandler = () => {
    setShowMobileConvMenu(false);
    submitDeleteConversation({ ...chatVisible });
    setChatVisible(null);
  };

  return (
    <>
      {showMobileConvMenu ? (
        <CustomConvContextMenu
          user={user}
          topic={chatVisible}
          pos={null}
          isHiddenTopic={false}
          closeModal={() => setShowMobileConvMenu(false)}
          onDeleteHandler={mobileLeaveConvHandler}
        />
      ) : null}
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
                    <button
                      onClick={handleMobileEditConvMenu}
                      aria-label="conversation menu"
                    >
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
              onLeaveHandler={submitDeleteConversation}
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
