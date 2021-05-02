import React, { useState, useEffect } from "react";
import { useComms } from "../contexts/comms";
import { useAuth } from "../contexts/auth";
import { useSocket } from "../contexts/socket";
import { saveTopics, addRoomToUsers } from "../requests/community";
import Modal from "./Modal";
import Form from "./Form-comp";
import Input from "./Common/Input";
import ToggleSwitch from "./Common/Toggle";
import { TextBtn } from "./Common/Button";

const TopicsNav = (props) => {
  const [modal, setModal] = useState();
  const [topicsArr, setTopicsArr] = useState([]);
  const [openTopicBuilder, setOpenTopicBuilder] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });
  const [toggleData, setToggleData] = useState({
    private: false,
  });
  const [errorData, setErrorData] = useState({
    title: false,
    description: false,
  });

  const { join, unreadMsg, unreadMsgs, newTopic, incomingTopic } = useSocket();
  const { user } = useAuth();
  const {
    grabTopics,
    comms,
    setComm,
    selectedcomm,
    topics,
    addNewTopic,
    setTopic,
    selectedTopic,
  } = useComms();

  useEffect(() => {
    setTopicsArr(topics);
  }, [topics]);

  useEffect(() => {
    if (incomingTopic) {
      setTopicsArr([...topicsArr, incomingTopic]);
    }
  }, [incomingTopic]);

  const showModal = () => {
    setModal(!modal);
  };

  const changeSelectedTopic = (topic) => {
    setTopic(topic);
  };

  const openCreateTopic = () => {
    setOpenTopicBuilder(!openTopicBuilder);
  };

  const submitHandler = async () => {
    let topic,
      userIds = [];
    if (toggleData.private) {
      userIds.push(user._id);
      topic = {
        comm_id: selectedcomm._id,
        members: [{ user_id: user._id, admin: true, muted: false }],
        title: formData.title,
        description: formData.description,
        private: toggleData.private,
        invites: [],
      };
    } else {
      selectedcomm.users.forEach((usr) => {
        userIds.push(usr.userId);
      });
      topic = {
        comm_id: selectedcomm._id,
        members: [
          { user_id: user._id, admin: true, muted: false },
          ...selectedcomm.users.map((usr) => {
            if (usr.userId !== user._id) {
              return { user_id: usr.userId, admin: false, muted: false };
            }
          }),
        ],
        title: formData.title,
        description: formData.description,
        private: toggleData.private,
        invites: [],
      };
    }
    const data = await saveTopics(topic);
    const { ok, id } = data;
    if (ok) {
      topic._id = id;
      setOpenTopicBuilder(false);
      if (id) {
        const results = await addRoomToUsers(userIds, id);
        newTopic(selectedcomm._id, topic, async (err, status) => {
          if (err) {
            console.log(err);
          }
          let { ok } = status;
        });
      }
    }
  };

  const inputChangeHandler = (eData, data) => {
    setErrorData(eData);
    setFormData(data);
  };

  const toggleHandler = (toggle, status) => {
    setToggleData({ ...toggleData, [toggle]: status });
  };

  const setMissing = (missing) => {
    setErrorData(missing);
  };

  return (
    <>
      {openTopicBuilder && (
        <Modal id="topic-builder" show={modal} onToggleModal={showModal}>
          <p>Add Topic</p>
          <Form
            id="topic-modal"
            on_submit={submitHandler}
            on_missing={setMissing}
            data={formData}
            errorData={errorData}
          >
            <Input
              title="Title"
              name="title"
              type="text"
              empty="true"
              value={formData.title}
              // isRequired={errorData["title"]}
              changeHandler={inputChangeHandler}
              data={formData}
              errorData={errorData}
            />
            <Input
              title="Description (optional)"
              name="description"
              type="text"
              empty="true"
              value={formData.description}
              changeHandler={inputChangeHandler}
              data={formData}
              errorData={errorData}
            />
            <div id="topic_create_private">
              <ToggleSwitch
                onToggleChange={toggleHandler}
                toggleName="private"
              ></ToggleSwitch>
              <p>
                Setting this topic to private will hide it from the community.
                You must invite people to the topic after it is created.
              </p>
            </div>
            <fieldset>
              <TextBtn
                text="Cancel"
                id="topic_create_cancel"
                onClick={openCreateTopic}
              />
              <TextBtn text="Create" id="topic_create_submit" type="submit" />
            </fieldset>
          </Form>
        </Modal>
      )}
      <aside id="topic_nav">
        <header>
          <p>Topics</p>
          <button id="create-topic" onClick={openCreateTopic}></button>
        </header>
        <ul id="left_nav_topics">
          {topicsArr &&
            topicsArr.map((topic) => {
              let classes = [];
              if ((selectedTopic || {})._id == topic._id) {
                classes.push("topic_active");
              }
              unreadMsgs.forEach((msg) => {
                if (
                  msg.topic_id === topic._id &&
                  msg.creator_id !== user._id &&
                  (selectedTopic || {})._id !== msg.topic_id
                ) {
                  classes.push("topic_new_message");
                }
              });

              return (
                <li
                  className={classes.join(" ")}
                  aria-label="nav-item"
                  key={topic._id}
                >
                  <button
                    onClick={() => {
                      changeSelectedTopic(topic);
                    }}
                    aria-label={topic.title}
                  >
                    {topic.title}
                  </button>
                </li>
              );
            })}
        </ul>
      </aside>
    </>
  );
};

export default TopicsNav;
