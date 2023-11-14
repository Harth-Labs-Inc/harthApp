import { useContext, useState } from "react";
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
import { useSocket } from "contexts/socket";
import { SpinningLoader } from "components/Common/SpinningLoader/SpinningLoader";

/* eslint-disable */
const ConversationsNav = ({
  toggleConversationEditModal,
  handleMobileChat,
  user,
}) => {
  const [openConversationBuilder, setOpenConversationBuilder] = useState(false);
  const [showDeleteConversationModal, setShowDeleteConversationModal] =
    useState(false);

  const { isMobile } = useContext(MobileContext);
  const {
    conversations,
    selectedConversation,
    setSelectedConversation,
    selectedcomm,
    isLoadingConversations,
  } = useComms();

  const { unreadConvMessagesRef } = useSocket();

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
        <CreateNewConversationModal toggleModal={openCreateConversation} />
      )}

      {showDeleteConversationModal ? (
        <Modal onToggleModal={() => {}}>
          <ConversationDeleteModal
            submitConversationChange={submitConversationDeleteHandler}
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
        {/* <p
          className={
            isMobile
              ? styles.ConversationsNavTitleMobile
              : styles.ConversationsNavTitle
          }
        >
          Messages
        </p> */}
        {isLoadingConversations ? (
          <div>
            <SpinningLoader spinnerOnly={true} />
          </div>
        ) : (
          <>
            {conversations < 1 ? (
              <div className={styles.notopic}>
                Select below to create a new message
              </div>
            ) : null}
            <div className={styles.ConversationsNavContainer}>
              {selectedcomm &&
                conversations &&
                conversations.map((conversation) => {
                  let isActive = false;
                  let isShort = false;
                  let hasAlert = false;
                  let alertProfiles = [];
                  if (
                    (selectedConversation || {})._id == (conversation || {})._id
                  ) {
                    isActive = true;
                  }

                  unreadConvMessagesRef.forEach((msg) => {
                    if (
                      msg.conversation_id === conversation._id &&
                      msg.creator_id !== user._id &&
                      (selectedConversation || {})._id !== msg.conversation_id
                    ) {
                      let owner = conversation?.OriginalUsers.find(
                        (member) => member?.userId === user._id
                      );
                      let isHarthMuted = false;
                      if (selectedcomm && user) {
                        let userIndex = selectedcomm.users.findIndex((usr) => {
                          return usr.userId == user._id;
                        });

                        if (userIndex >= 0) {
                          let profile = selectedcomm.users[userIndex];
                          isHarthMuted = profile?.muted;
                        }
                      }
                      if (!isHarthMuted && (!owner || !owner.muted)) {
                        hasAlert = true;
                        let match = alertProfiles.find(
                          (prof) => prof.creator_id == msg.creator_id
                        );
                        if (!match) {
                          alertProfiles.push(msg);
                        }
                      }
                    }
                  });

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
                      toggleConversationEditModal={toggleConversationEditModal}
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
                  className={isMobile ? styles.CreateMobile : styles.Create}
                  id="create_conversation"
                  onClick={openCreateConversation}
                >
                  <IconAdd />
                </button>
              </div>
            </div>
          </>
        )}
      </aside>
    </>
  );
};

export default ConversationsNav;
