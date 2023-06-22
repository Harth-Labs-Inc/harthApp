import { useContext, useState, useEffect } from "react";

import { useComms } from "../../../contexts/comms";
import { useAuth } from "../../../contexts/auth";
import { useSocket } from "../../../contexts/socket";
import { MobileContext } from "../../../contexts/mobile";
import { Modal } from "../../Common";
import { updatedTopic, deleteTopicByID } from "../../../requests/community";
import TopicEditModal from "../../TopicEditModal";
import TopicDeleteModal from "../../TopicDeleteModal";

import TopicListElement from "../../Topics/TopicListElement";
import { IconAdd } from "../../../resources/icons/IconAdd";

import { CustomContextMenu } from "../../CustomContextMenu/CustomContextMenu";
import CreateNewTopicModal from "./CreateNewTopicModal/CreateNewTopicModal";
import styles from "./TopicsNav.module.scss";

const TopicsNav = (props) => {
  const [topicsArr, setTopicsArr] = useState([]);
  const [hiddenTopicsArr, setHiddenTopicsArr] = useState([]);
  const [isHiddenView, setIsHiddenView] = useState(false);
  const [showRenameTopicModal, setShowRenameTopicModal] = useState(false);
  const [openTopicBuilder, setOpenTopicBuilder] = useState(false);
  const [openEditTopicMenu, setOpenEditTopicMenu] = useState(null);
  const [showDeleteTopicModal, setShowDeleteTopicModal] = useState(false);

  const { isMobile } = useContext(MobileContext);
  const { incomingTopic, emitUpdate, unreadMessagesRef } = useSocket();
  const { user } = useAuth();
  const { topics, setTopic, selectedTopic, updateSelectedTopic, selectedcomm } =
    useComms();

  useEffect(() => {
    if (topics) {
      const unhiddenTopics = topics.filter(({ members }) => {
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
      const hiddenTopics = topics.filter(({ members }) => {
        let userIndex = members.findIndex(({ user_id }) => {
          return user_id == user._id;
        });

        let isHidden;

        if (userIndex >= 0) {
          let profile = members[userIndex];
          isHidden = profile?.hidden;
        }
        if (isHidden) {
          return true;
        }
      });

      unhiddenTopics.sort((a, b) => {
        const removeEmoji = (str) => {
          return str
            .replace(
              /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
              ""
            )
            .replace(/\s+/g, " ")
            .trim();
        };
        const nameA = removeEmoji(a.title);
        const nameB = removeEmoji(b.title);

        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }

        return 0;
      });
      hiddenTopics.sort((a, b) => {
        const removeEmoji = (str) => {
          return str
            .replace(
              /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
              ""
            )
            .replace(/\s+/g, " ")
            .trim();
        };
        const nameA = removeEmoji(a.title);
        const nameB = removeEmoji(b.title);

        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }

        return 0;
      });

      setTopicsArr(unhiddenTopics);
      setHiddenTopicsArr(hiddenTopics);
    }
  }, [topics]);
  useEffect(() => {
    if (incomingTopic._id) {
      setTopicsArr([...topics, incomingTopic]);
    }
  }, [incomingTopic]);

  const handleMobileChatWindow = (newValue) => {
    props.handleMobileChat(newValue);
  };
  const changeSelectedTopic = (topic) => {
    let imgs = document.getElementsByClassName("active-image");

    for (let img of imgs) {
      if (img) {
        img.setAttribute("src", "");
      }
    }
    setTopic(topic);
    {
      isMobile && handleMobileChatWindow(true);
    }
  };
  const openCreateTopic = () => {
    setOpenTopicBuilder(!openTopicBuilder);
  };
  const toggleTopicEditModal = ({ topic, pos, isHidden }) => {
    setOpenEditTopicMenu({ topic, pos, isHidden });
  };
  const closeTopicEditModal = () => {
    if (!showRenameTopicModal && !showDeleteTopicModal) {
      setOpenEditTopicMenu(null);
    }
  };
  const toggleHidden = () => {
    setIsHiddenView(!isHiddenView);
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
              return {
                ...usr,
                hidden: !usr.hidden,
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
      {openTopicBuilder && (
        <CreateNewTopicModal toggleModal={openCreateTopic} />
      )}
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

      <aside
        className={`
                ${styles.TopicsNav}
                ${isMobile && styles.TopicsNavMobile}
                `}
      >
        <p
          className={
            isMobile ? styles.TopicsNavTitleMobile : styles.TopicsNavTitle
          }
        >
          Topics
        </p>
        <div className={styles.TopicsNavContainer}>
          {selectedcomm &&
            topicsArr &&
            topicsArr.map((topic) => {
              let isActive = false;
              let isShort = false;
              let hasAlert = false;
              let alertProfiles = [];
              if ((selectedTopic || {})._id == (topic || {})._id) {
                isActive = true;
              }
              unreadMessagesRef.forEach((msg) => {
                if (
                  msg.topic_id === topic._id &&
                  msg.creator_id !== user._id &&
                  (selectedTopic || {})._id !== msg.topic_id
                ) {
                  let owner = topic?.members.find(
                    (member) => member?.user_id === user._id
                  );
                  if (!owner || !owner.muted) {
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

              if (topic?.contentAge == "short") {
                isShort = true;
              }
              return (
                <TopicListElement
                  clickHandler={changeSelectedTopic}
                  key={topic._id}
                  topic={topic}
                  isMobile={isMobile}
                  hasAlert={hasAlert}
                  alertProfiles={alertProfiles}
                  isActive={isActive}
                  isShort={isShort}
                  label={topic?.title}
                  toggleTopicEditModal={toggleTopicEditModal}
                />
              );
            })}

          <button
            id="create_topic"
            className={isMobile ? styles.CreateTopicMobile : styles.CreateTopic}
            onClick={openCreateTopic}
          >
            <IconAdd />
          </button>

          {hiddenTopicsArr.length > 0 && (
            <button
              className={`
                            ${styles.TopicsNavHidden}
                            ${isMobile && styles.TopicsNavHiddenMobile}
                            ${isHiddenView && styles.TopicsNavHiddenActive}
                            `}
              onClick={toggleHidden}
            >
              Hidden
            </button>
          )}
          {isHiddenView &&
            hiddenTopicsArr &&
            hiddenTopicsArr.map((topic) => {
              let isActive = false;
              let isShort = false;
              let hasAlert = false;
              let alertProfiles = [];
              if ((selectedTopic || {})._id == (topic || {})._id) {
                isActive = true;
              }
              unreadMessagesRef.forEach((msg) => {
                if (
                  msg.topic_id === topic._id &&
                  msg.creator_id !== user._id &&
                  (selectedTopic || {})._id !== msg.topic_id
                ) {
                  let owner = topic?.members.find(
                    (member) => member?.user_id === user._id
                  );
                  if (!owner || (!owner.muted && !owner.hidden)) {
                    hasAlert = true;
                    alertProfiles.push(msg);
                  }
                }
              });

              if (topic?.contentAge == "short") {
                isShort = true;
              }
              return (
                <>
                  <p className={styles.spacer} />
                  <TopicListElement
                    clickHandler={changeSelectedTopic}
                    key={topic._id}
                    topic={topic}
                    isMobile={isMobile}
                    hasAlert={hasAlert}
                    alertProfiles={alertProfiles}
                    isActive={isActive}
                    isShort={isShort}
                    label={topic?.title}
                    toggleTopicEditModal={toggleTopicEditModal}
                    isHidden={true}
                  />
                </>
              );
            })}
        </div>
      </aside>
    </>
  );
};

export default TopicsNav;
