import React, { createContext, useState, useContext, useEffect } from "react";
import {
  getComms,
  getTopics,
  updatedTopic,
  updateHarthData,
} from "../requests/community";
import {
  getConversations,
  getConversationMessages,
} from "../requests/conversations";
import { getRooms } from "../requests/rooms";
import { useAuth } from "./auth";

const CommsContext = createContext({});

export const CommsProvider = ({ children }) => {
  const [comms, setComms] = useState(null);
  const [selectedcomm, setSelectedcomm] = useState(null);
  const [topics, setTopics] = useState(null);
  const [rooms, setRooms] = useState({});
  const [selectedTopic, setSelectedTopic] = useState({});
  const [topicChange, setTopicChange] = useState(0);
  const [profile, setProfile] = useState(null);

  const [conversations, setConversations] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [conversationMessages, setConversationMessages] = useState({});
  const [incomingConversationMsg, setIncomingConversationMsg] = useState({});
  const [incomingConversationMsgUpdate, setIncomingConversationMsgUpdate] =
    useState({});

  const [unreadConversationMsg, setUnreadConversationMsg] = useState({});
  const [unreadConversationMsgs, setUnreadConversationMsgs] = useState([]);

  const { user } = useAuth();
  const { incomingTopic } = useAuth();

  useEffect(() => {
    if (user) {
      if (user?.comms && user?.comms.length > 0) {
        (async () => {
          let result = await getComms(user);
          const { ok, comms } = result;
          if (ok) {
            setComms(comms);
            setComm(comms[0]);
          }
        })();
      }
    }
  }, [user]);

  useEffect(() => {
    if (selectedcomm) {
      if (user) {
        setTopicChange(0);
        grabTopics(selectedcomm._id);
        grabRooms(selectedcomm._id);
        fetchConversations();
        let creator = selectedcomm.users.find((usr) => usr.userId === user._id);
        if (creator) setProfile(creator);
      }
    }
  }, [selectedcomm, user]);

  useEffect(() => {
    localStorage.setItem("selected_topic", JSON.stringify(selectedTopic || {}));
  }, [selectedTopic]);

  useEffect(() => {
    if (selectedConversation) {
      grabConversationMessages();
    }
  }, [selectedConversation]);

  const grabConversationMessages = async () => {
    const sortMessages = (msgs) => {
      return msgs.sort((a, b) => new Date(a.date) - new Date(b.date)).reverse();
    };
    let results = await getConversationMessages(selectedConversation);
    const { ok, fetchResults } = results;
    if (ok) {
      setConversationMessages({
        ...conversationMessages,
        [selectedConversation._id]: sortMessages(fetchResults),
      });
    }
  };

  const refetchComms = async (newCom) => {
    return new Promise((resolve) => {
      async function run() {
        let result = await getComms(user);
        const { ok, comms } = result;
        if (ok) {
          setComms(comms);
          if (newCom) {
            setComm(newCom);
          } else if (!profile) {
            setComm(comms[0]);
          }
          resolve(comms);
        }
      }
      run();
    });
  };
  const updateSelectedTopic = async ({ newTopic }) => {
    return new Promise((resolve) => {
      async function run() {
        let tmpTopics = [...topics];
        let matchingTopicIndex = -1;
        tmpTopics.forEach((topic, index) => {
          if (topic._id === newTopic._id) {
            matchingTopicIndex = index;
          }
        });
        if (matchingTopicIndex >= 0) {
          tmpTopics[matchingTopicIndex] = newTopic;
          setTopics(tmpTopics);
          if (selectedTopic._id == newTopic._id) {
            setSelectedTopic(newTopic);
          }
          await updatedTopic({
            type: "replace",
            topic: newTopic,
          });
          resolve(true);
        }
      }
      run();
    });
  };
  const updateSelectedHarth = async ({ newHarth }) => {
    return new Promise((resolve) => {
      async function run() {
        let tmpComms = [...comms];
        let matchingIndex = -1;
        tmpComms.forEach((com, index) => {
          if (com._id === newHarth._id) {
            matchingIndex = index;
          }
        });
        if (matchingIndex >= 0) {
          tmpComms[matchingIndex] = newHarth;
          setComms(tmpComms);
          if (selectedcomm._id == newHarth._id) {
            setSelectedcomm(newHarth);
          }
          let { ok } = await updateHarthData(newHarth);

          resolve(true);
        }
      }
      run();
    });
  };
  const updateLocalSelectedHarth = async ({ newHarth }) => {
    return new Promise((resolve) => {
      async function run() {
        let tmpComms = [...comms];
        let matchingIndex = -1;
        tmpComms.forEach((com, index) => {
          if (com._id === newHarth._id) {
            matchingIndex = index;
          }
        });
        if (matchingIndex >= 0) {
          tmpComms[matchingIndex] = newHarth;
          setComms(tmpComms);
          if (selectedcomm._id == newHarth._id) {
            setSelectedcomm(newHarth);
          }

          resolve(true);
        }
      }
      run();
    });
  };
  const grabTopics = async (comid) => {
    let result = await getTopics(comid, user._id);
    const { ok, topics } = result;
    if (ok) {
      let startingTopic;
      let filteredTopics = topics.sort((a, b) => {
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

      for (let topic of filteredTopics) {
        for (let member of topic.members) {
          if (member.user_id == user._id) {
            if (!member.hidden && !startingTopic) {
              startingTopic = topic;
            }
          }
        }
      }
      setTopics(filteredTopics);
      setSelectedTopic(startingTopic);
    }
    return;
  };
  const grabRooms = async (comid) => {
    if (comid) {
      if (!(comid in rooms)) {
        rooms[comid] = [];
        let result = await getRooms(comid, user._id);
        const { ok, rms } = result;
        if (ok) {
          setRooms({ ...rooms, [comid]: rms });
        }
      }
    }
  };
  const setComm = async (comm) => {
    setSelectedcomm(comm);
  };
  const setCommsFromChild = (comms) => {
    setComms(comms);
  };
  const setTopic = async (topic) => {
    setTopicChange((prevState) => (prevState += 1));
    setSelectedTopic(topic);
  };
  const addNewTopic = (newTopic) => {
    setTopics([...topics, newTopic]);
  };
  const topicChangeHandler = async ({ type, status, user }) => {
    let tmpTopics = [...topics];
    let matchingTopicIndex = -1;
    let tmpSelectedTopic = { ...selectedTopic };
    tmpTopics.forEach((topic, index) => {
      if (topic._id === selectedTopic._id) {
        matchingTopicIndex = index;
      }
    });
    if (matchingTopicIndex >= 0) {
      switch (type) {
        // case 'edit':
        //   console.log('made it to edit', user)
        //   tmpTopics[matchingTopicIndex] = user

        //   setTopics(tmpTopics)
        //   await updatedTopic({ type: 'replace', topic: user })

        //   break
        case "mute":
          tmpSelectedTopic?.members?.filter(Boolean).forEach((member) => {
            if (member._id === user._id) {
              member.muted = status;
            }
          });
          tmpTopics[matchingTopicIndex] = tmpSelectedTopic;

          setTopics(tmpTopics);
          await updatedTopic({
            type: "replace",
            topic: tmpSelectedTopic,
          });

          break;
        case "leave":
          let newMembers = tmpSelectedTopic?.members.filter((member, index) => {
            if (member && member._id !== user._id) {
              return member;
            }
            return false;
          });
          tmpSelectedTopic.members = newMembers;
          tmpTopics[matchingTopicIndex] = tmpSelectedTopic;
          setTopics(tmpTopics);
          grabTopics(selectedcomm._id);
          grabRooms(selectedcomm._id);
          await updatedTopic({
            type: "replace",
            topic: tmpSelectedTopic,
          });

          break;
        default:
          break;
      }
    }
  };
  const fetchConversations = async () => {
    let result = await getConversations(selectedcomm._id, user._id);
    const { ok, conversations } = result;
    if (ok) {
      setConversations(conversations);
      setSelectedConversation(conversations[0] || {});
    }
    return;
  };
  const setUnreadConversationMessagesHandler = (incomingMsg) => {
    if (incomingMsg.userIDS?.includes(user?._id || "")) {
      setIncomingConversationMsg(incomingMsg);
    }
  };

  return (
    <CommsContext.Provider
      value={{
        updateLocalSelectedHarth,
        updateSelectedHarth,
        updateSelectedTopic,
        profile,
        refetchComms,
        rooms,
        topicChange,
        setRooms,
        grabTopics,
        comms,
        setCommsFromChild,
        setComm,
        selectedcomm,
        topics,
        addNewTopic,
        setTopic,
        selectedTopic,
        topicChangeHandler,
        setTopics,
        setSelectedTopic,
        setConversations,
        conversations,
        selectedConversation,
        setSelectedConversation,
        setConversationMessages,
        conversationMessages,
        fetchConversations,
        setUnreadConversationMsgs,
        setUnreadConversationMsg,
        setIncomingConversationMsg,
        unreadConversationMsgs,
        unreadConversationMsg,
        incomingConversationMsg,
        setUnreadConversationMessagesHandler,
        setIncomingConversationMsgUpdate,
        incomingConversationMsgUpdate,
      }}
    >
      {children}
    </CommsContext.Provider>
  );
};

export const useComms = () => useContext(CommsContext);
