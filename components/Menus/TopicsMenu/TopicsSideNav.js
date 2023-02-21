import { useContext, useState, useEffect } from "react";

import { useComms } from "../../../contexts/comms";
import { useAuth } from "../../../contexts/auth";
import { useChat } from "../../../contexts/chat";
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
  const { setSelectedReplyOwner } = useChat();

  useEffect(() => {
    if (topics) {
      let unhiddenTopics = topics.filter(({ members }) => {
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
      let hiddenTopics = topics.filter(({ members }) => {
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

      setTopicsArr(unhiddenTopics);
      setHiddenTopicsArr(hiddenTopics);
    }
  }, [topics]);
  useEffect(() => {
    if (incomingTopic._id) {
      setTopicsArr([...topics, incomingTopic]);
    }
  }, [incomingTopic]);

  useEffect(() => {
    document.addEventListener("contextmenu", (event) => {
      event.preventDefault();
    });

    return () => {
      window.removeEventListener("contextmenu", () => {});
    };
  }, []);

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
    setSelectedReplyOwner({});
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
    emitUpdate(selectedcomm._id, msg, async (err, status) => {
      if (err) {
      }
      setShowRenameTopicModal(false);
      setOpenEditTopicMenu(null);
    });
  };
  const onDeleteHandler = () => {
    console.log("onDeleteHandler");
    setShowDeleteTopicModal(true);
  };
  const onCloseDeleteModal = () => {
    setShowDeleteTopicModal(false);
  };
  const submitTopicDeleteHandler = async (newTopic) => {
    await deleteTopicByID(newTopic._id);
    let msg = {};
    msg.updateType = "topic deleted";
    msg.comm = selectedcomm;
    msg.topic = newTopic;
    emitUpdate(selectedcomm._id, msg, async (err, status) => {
      if (err) {
        console.log(err);
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
        <p className={styles.TopicsNavTitle}>Topics</p>
        <div className={styles.TopicsNavContainer}>
          {topicsArr &&
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

          <div
            className={
              isMobile ? styles.TopicsNavCreateMobile : styles.TopicsNavCreate
            }
          >
            <button id="create_topic" onClick={openCreateTopic}>
              <div className={styles.iconHolder}>
                <IconAdd />
              </div>
            </button>
          </div>
          {hiddenTopicsArr.length > 0 && (
            <button
              className={`
                            ${styles.TopicsNavHidden}
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

// import { useContext, useState, useEffect } from "react";

// import { useComms } from "../contexts/comms";
// import { useAuth } from "../contexts/auth";
// import { useChat } from "../contexts/chat";
// import { useSocket } from "../contexts/socket";
// import { MobileContext } from "../contexts/mobile";
// import { saveTopics } from "../requests/community";
// import { addRoomToUsers } from "../requests/rooms";

// import { Input, Modal, TextArea, TextBtn, Toggle } from "./Common";
// import Form from "./Form-comp";

// const TopicsNav = (props) => {
//     const [modal, setModal] = useState();
//     const [topicsArr, setTopicsArr] = useState([]);
//     const [openTopicBuilder, setOpenTopicBuilder] = useState(false);
//     const [formData, setFormData] = useState({
//         title: "",
//         description: "",
//     });
//     const [toggleData, setToggleData] = useState({
//         private: false,
//     });
//     const [errorData, setErrorData] = useState({
//         title: false,
//         description: false,
//     });
//     const { isMobile } = useContext(MobileContext);

//     const { unreadMsgs, emitUpdate, incomingTopic } = useSocket();
//     const { user } = useAuth();
//     const { selectedcomm, topics, setTopic, selectedTopic } = useComms();
//     const { setSelectedReplyOwner } = useChat();

//     useEffect(() => {
//         setTopicsArr(topics);
//     }, [topics]);
//     useEffect(() => {
//         if (incomingTopic._id) {
//             setTopicsArr([...topics, incomingTopic]);
//         }
//     }, [incomingTopic]);

//     const changeSelectedTopic = (topic) => {
//         setTopic(topic);
//         setSelectedReplyOwner({});
//     };
//     const openCreateTopic = () => {
//         setOpenTopicBuilder(!openTopicBuilder);
//     };
//     const submitHandler = async () => {
//         console.log("test");
//         let topic,
//             userIds = [];
//         if (toggleData.private) {
//             userIds.push(user._id);
//             topic = {
//                 comm_id: selectedcomm._id,
//                 members: [
//                     { user_id: user._id, admin: true, muted: false, ...user },
//                 ],
//                 title: formData.title,
//                 description: formData.description,
//                 private: toggleData.private,
//                 invites: [],
//             };
//         } else {
//             selectedcomm.users.forEach((usr) => {
//                 userIds.push(usr.userId);
//             });
//             topic = {
//                 comm_id: selectedcomm._id,
//                 members: [
//                     { user_id: user._id, admin: true, muted: false, ...user },
//                     ...((selectedcomm || {}).users || []).map((usr) => {
//                         if (usr.userId !== user._id) {
//                             return {
//                                 user_id: usr.userId,
//                                 admin: false,
//                                 muted: false,
//                                 ...usr,
//                             };
//                         }
//                     }),
//                 ],
//                 title: formData.title,
//                 description: formData.description,
//                 private: toggleData.private,
//                 invites: [],
//             };
//         }
//         const data = await saveTopics(topic);
//         const { ok, id } = data;
//         if (ok) {
//             topic._id = id;
//             setOpenTopicBuilder(false);
//             if (id) {
//                 const results = await addRoomToUsers(userIds, id);
//                 topic.updateType = "new topic";
//                 emitUpdate(selectedcomm._id, topic, async (err, status) => {
//                     if (err) {
//                         console.log(err);
//                     }
//                     let { ok } = status;
//                 });
//             }
//         }
//     };
//     const inputChangeHandler = (eData, data) => {
//         setErrorData(eData);
//         setFormData(data);
//     };
//     const toggleHandler = (toggle, status) => {
//         setToggleData({ ...toggleData, [toggle]: status });
//     };
//     const setMissing = (missing) => {
//         setErrorData(missing);
//     };

//     return (
//         <>
//             {openTopicBuilder && (
//                 <Modal id="topic_builder" onToggleModal={openCreateTopic}>
//                     <h2>Add a topic</h2>
//                     <form>
//                         <label>
//                             <input placeholder="Topic name" required />
//                         </label>
//                         <p>Keep content posted to this topic for:</p>
//                         <label>
//                             90 days
//                             <input
//                                 type="radio"
//                                 value="long"
//                                 name="group1"
//                                 required
//                             />
//                         </label>
//                         <label>
//                             24 hours
//                             <input type="radio" value="short" name="group1" />
//                         </label>
//                         <button type="button">Cancel</button>
//                         <button type="submit">Create Topic</button>
//                     </form>
//                     {/* <Form
//                         id="topic_modal"
//                         on_submit={submitHandler}
//                         on_missing={setMissing}
//                         data={formData}
//                         errorData={errorData}
//                     >
//                         <Input
//                             title="Add topic title"
//                             name="title"
//                             type="text"
//                             empty="true"
//                             value={formData.title}
//                             isRequired={errorData["title"]}
//                             changeHandler={inputChangeHandler}
//                             data={formData}
//                             errorData={errorData}
//                             placeholder="Title"
//                         />
//                         <TextArea
//                             title="Add topic description"
//                             name="description"
//                             type="text"
//                             empty="true"
//                             value={formData.description}
//                             changeHandler={inputChangeHandler}
//                             data={formData}
//                             errorData={errorData}
//                             row="20"
//                         />
//                         <p>Make Private</p>
//                         <div id="topic_create_private">
//                             <Toggle
//                                 onToggleChange={toggleHandler}
//                                 toggleName="private"
//                             ></Toggle>
//                             <p>
//                                 Setting this topic to private will hide it from
//                                 the community. You must invite people to the
//                                 topic after it is created.
//                             </p>
//                         </div>
//                         <fieldset>
//                             <TextBtn
//                                 text="Cancel"
//                                 id="topic_create_cancel"
//                                 onClick={openCreateTopic}
//                             />
//                             <TextBtn
//                                 text="Create"
//                                 id="topic_create_submit"
//                                 type="submit"
//                             />
//                         </fieldset>
//                     </Form> */}
//                 </Modal>
//             )}
//             <aside id="topicNav">
//                 {isMobile ? (
//                     <span id="topicNavHeader">
//                         <p>Chat</p>
//                         <p>user profile</p>
//                     </span>
//                 ) : null}
//                 <ul id="left_nav_topics">
//                     {topicsArr &&
//                         topicsArr.map((topic) => {
//                             let classes = [];
//                             if (
//                                 (selectedTopic || {})._id == (topic || {})._id
//                             ) {
//                                 classes.push("topic_active");
//                             }
//                             unreadMsgs.forEach((msg) => {
//                                 if (
//                                     msg.topic_id === topic._id &&
//                                     msg.creator_id !== user._id &&
//                                     (selectedTopic || {})._id !== msg.topic_id
//                                 ) {
//                                     console.log("this is the topic", topic);
//                                     let owner = topic?.members.find(
//                                         (member) => member?.user_id === user._id
//                                     );
//                                     console.log(owner);
//                                     if (!owner || !owner.muted) {
//                                         classes.push("topic_new_message");
//                                     }
//                                 }
//                             });

//                             return (
//                                 <li
//                                     className={classes.join(" ")}
//                                     aria-label="nav-item"
//                                     key={topic._id}
//                                 >
//                                     <button
//                                         onClick={() => {
//                                             changeSelectedTopic(topic);
//                                         }}
//                                         aria-label={topic?.title}
//                                     >
//                                         {topic?.title}
//                                     </button>
//                                 </li>
//                             );
//                         })}
//                     <li key="add new button">
//                         <button id="create_topic" onClick={openCreateTopic}>
//                             topic
//                         </button>
//                     </li>
//                 </ul>
//             </aside>
//         </>
//     );
// };

// export default TopicsNav;
