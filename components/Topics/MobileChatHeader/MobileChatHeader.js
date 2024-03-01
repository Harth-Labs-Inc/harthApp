import { Modal } from "Common";

import { useComms } from "../../../contexts/comms";
import { useAuth } from "../../../contexts/auth";
import { useSocket } from "../../../contexts/socket";
import { updatedTopic, deleteTopicByID } from "../../../requests/community";

import { CustomContextMenu } from "../../CustomContextMenu/CustomContextMenu";
import TopicEditModal from "../../TopicEditModal";
import TopicDeleteModal from "../../TopicDeleteModal";

import { IconMoreDots } from "../../../resources/icons/IconMoreDots";
import { IconChevronLeft } from "../../../resources/icons/IconChevronLeft";

import styles from "./MobileChatHeader.module.scss";
import { useState } from "react";

const MobileChatHeader = ({ handleMobileChat, selectedTopic }) => {
  const [openEditTopicMenu, setOpenEditTopicMenu] = useState(null);
  const [showRenameTopicModal, setShowRenameTopicModal] = useState(false);
  const [showDeleteTopicModal, setShowDeleteTopicModal] = useState(false);
  const { user } = useAuth();
  const { emitUpdate } = useSocket();
  const { updateSelectedTopic, selectedcomm } = useComms();
  const handleBackToNav = () => {
    handleMobileChat(false);
  };

  const handleEditTopicMenu = () => {
    setOpenEditTopicMenu({
      topic: selectedTopic,
      pos: null,
    });
  };

  const closeTopicEditModal = () => {
    if (!showRenameTopicModal && !showDeleteTopicModal) {
      setOpenEditTopicMenu(null);
    }
  };
  const onRenameHandler = () => {
    setShowRenameTopicModal(true);
  };
  const onCloseRenameModal = () => {
    setShowRenameTopicModal(false);
  };
  const submitTopicChangeHandler = async (newTopic) => {
    await updatedTopic({
      type: "replace",
      topic: newTopic,
    });
    let msg = {};
    msg.updateType = "topic edited";
    msg.comm = selectedcomm;
    msg.topic = newTopic;
    emitUpdate(selectedcomm._id, msg, async (err) => {
      if (err) {
        console.error(err);
      }
      setShowRenameTopicModal(false);
      setOpenEditTopicMenu(null);
    });
  };

  const onMuteHandler = async () => {
    await updateSelectedTopic({
      newTopic: {
        ...openEditTopicMenu.topic,
        members: [
          ...(openEditTopicMenu.topic.members || []).map((usr) => {
            if (usr.user_id == user._id) {
              return {
                ...usr,
                muted: !usr.muted,
              };
            } else {
              return usr;
            }
          }),
        ],
      },
    });
    closeTopicEditModal();
  };
  const onHideHandler = async () => {
    await updateSelectedTopic({
      newTopic: {
        ...openEditTopicMenu.topic,
        members: [
          ...(openEditTopicMenu.topic.members || []).map((usr) => {
            if (usr.user_id == user._id) {
              let isHidden = !usr.hidden;
              return {
                ...usr,
                hidden: isHidden,
                muted: isHidden,
              };
            } else {
              return usr;
            }
          }),
        ],
      },
    });
    closeTopicEditModal();
  };
  const onDeleteHandler = () => {
    setShowDeleteTopicModal(true);
  };
  const onCloseDeleteModal = () => {
    setShowDeleteTopicModal(false);
  };
  const submitTopicDeleteHandler = async (newTopic) => {
    await deleteTopicByID(newTopic._id, selectedcomm._id);
    let msg = {};
    msg.updateType = "topic deleted";
    msg.comm = selectedcomm;
    msg.topic = newTopic;
    emitUpdate(selectedcomm._id, msg, async (err) => {
      if (err) {
        console.error(err);
      }
      setShowDeleteTopicModal(false);
      setOpenEditTopicMenu(null);
    });
  };

  return (
    <>
      {openEditTopicMenu ? (
        <CustomContextMenu
          user={user}
          topic={openEditTopicMenu.topic}
          pos={openEditTopicMenu.pos}
          isHiddenTopic={openEditTopicMenu.isHidden}
          closeModal={closeTopicEditModal}
          onMuteHandler={onMuteHandler}
          onHideHandler={onHideHandler}
          onRenameHandler={onRenameHandler}
          onDeleteHandler={onDeleteHandler}
        />
      ) : null}
      {showRenameTopicModal ? (
        <Modal onToggleModal={() => {}}>
          <TopicEditModal
            submitTopicChange={submitTopicChangeHandler}
            hidden={!showRenameTopicModal}
            setHidden={onCloseRenameModal}
            topic={{
              ...(openEditTopicMenu?.topic || {}),
            }}
          />
        </Modal>
      ) : null}
      {showDeleteTopicModal ? (
        <Modal onToggleModal={() => {}}>
          <TopicDeleteModal
            submitTopicChange={submitTopicDeleteHandler}
            hidden={!showDeleteTopicModal}
            setHidden={onCloseDeleteModal}
            topic={{
              ...(openEditTopicMenu?.topic || {}),
            }}
          />
        </Modal>
      ) : null}

      <div className={styles.MobileChatHeader} id="chatHeader">
        <button onClick={handleBackToNav} aria-label="back">
          <IconChevronLeft />
        </button>
        <p>
          <span className={styles.emojiHolder}>{selectedTopic.marker}</span>
          {selectedTopic.title}
        </p>
        <button onClick={handleEditTopicMenu} aria-label="topic menu">
          <IconMoreDots />
        </button>
      </div>
    </>
  );
};

export default MobileChatHeader;
