import { createContext, useState, useContext, useEffect, useRef } from "react";
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
import { useRouter } from "next/router";
import { MobileContext } from "../contexts/mobile";

const CommsContext = createContext({});

export const CommsProvider = ({
  children,
  CommsArr,
  CREATOR,
  SELECTEDCOMM,
  TOPICS,
  currentPage,
  ConversationsArray,
}) => {
  const [comms, setComms] = useState(CommsArr);
  const [selectedcomm, setSelectedcomm] = useState(SELECTEDCOMM);
  const [topics, setTopics] = useState(TOPICS);
  const [rooms, setRooms] = useState({});
  const [selectedTopic, setSelectedTopic] = useState({});
  const [topicChange, setTopicChange] = useState(0);
  const [profile, setProfile] = useState(CREATOR);
  const [forceHarthCreation, setForceHarthCreation] = useState(false);
  const [conversations, setConversations] = useState(ConversationsArray);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [conversationMessages, setConversationMessages] = useState({});
  const [incomingConversationMsg, setIncomingConversationMsg] = useState({});
  const [incomingConversationMsgUpdate, setIncomingConversationMsgUpdate] =
    useState({});

  const [unreadConversationMsg, setUnreadConversationMsg] = useState({});
  const [unreadConversationMsgs, setUnreadConversationMsgs] = useState([]);

  const { user } = useAuth();

  const selectedCommRef = useRef(SELECTEDCOMM);
  const profileRef = useRef(CREATOR);
  const selectedTopicRef = useRef({});

  const { isMobile } = useContext(MobileContext);

  const router = useRouter();
  const {
    query: { gather_window },
  } = router;

  useEffect(() => {
    if (TOPICS && !isMobile) {
      setStartingTopic(TOPICS);
    }
  }, [TOPICS, isMobile]);

  useEffect(() => {
    if (selectedcomm) {
      if (user) {
        if (!gather_window) {
          setTopicChange(0);
          grabRooms(selectedcomm._id);
          let creator = selectedcomm.users?.find(
            (usr) => usr.userId === user._id
          );
          if (creator) setProfile(creator);
        }
      }
    }
  }, [selectedcomm, user]);

  useEffect(() => {
    if (
      !isMobile &&
      conversations?.length &&
      (selectedConversation == null ||
        !Object.keys(selectedConversation || {}).length)
    ) {
      setSelectedConversation(conversations[0]);
    }
  }, [conversations, isMobile]);

  useEffect(() => {
    if (selectedConversation) {
      grabConversationMessages();
    }
  }, [selectedConversation]);

  useEffect(() => {
    profileRef.current = profile;
  }, [profile, setProfile]);

  useEffect(() => {
    selectedTopicRef.current = selectedTopic;
  }, [selectedTopic]);

  const setStartingTopic = (tpcs) => {
    let startingTopic;

    for (let topic of tpcs) {
      for (let member of topic.members) {
        if (member.user_id == user._id) {
          if (!member.hidden && !startingTopic) {
            startingTopic = topic;
          }
        }
      }
    }
    let storedHarthData = localStorage.getItem("harthData");
    if (storedHarthData) {
      try {
        const parsedStoredHarthData = JSON.parse(storedHarthData);
        const matchingHarth =
          parsedStoredHarthData[selectedCommRef.current?._id] || {};

        if (matchingHarth.selected_topic) {
          const matchingTopic = matchingHarth.selected_topic;
          if (matchingTopic) {
            for (let member of matchingTopic.members) {
              if (member.user_id == user._id) {
                if (!member.hidden) {
                  startingTopic = matchingTopic;
                }
              }
            }
          }
        }
      } catch (error) {
        console.log();
      }
    }

    setSelectedTopic(startingTopic);
  };
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
  const refetchComms = async (newCom, setNew) => {
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
          if (setNew) {
            setComm(comms[0]);
          }
          if (!comms.length) {
            setForceHarthCreation(true);
          }
          resolve(comms);
        }
      }
      setForceHarthCreation(false);
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
            if (selectedTopic) {
              let storedData = localStorage.getItem("harthData");

              try {
                storedData = JSON.parse(storedData);
              } catch (error) {
                console.log(error);
                storedData = {};
              }
              if (!storedData) {
                storedData = {};
              }
              storedData[selectedCommRef.current?._id] = {
                ...(storedData[selectedCommRef.current?._id] || {}),
                selected_topic: selectedTopic,
              };
              localStorage.setItem("harthData", JSON.stringify(storedData));
            }
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
            selectedCommRef.current = newHarth;
          }
          await updateHarthData(newHarth);

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
            selectedCommRef.current = newHarth;
          }

          resolve(true);
        }
      }
      run();
    });
  };
  const fetchConversations = async (comid) => {
    let result = await getConversations(comid, user._id);
    const { ok, conversations } = result;
    if (ok) {
      setConversations(conversations);
      if (!isMobile) {
        setSelectedConversation(conversations[0] || {});
      }
    }
    return;
  };
  const grabTopics = async (comid) => {
    let result = await getTopics(comid, user._id);
    const { ok, topics } = result;
    if (ok) {
      if (!isMobile) {
        let startingTopic;

        for (let topic of topics) {
          for (let member of topic.members) {
            if (member.user_id == user._id) {
              if (!member.hidden && !startingTopic) {
                startingTopic = topic;
              }
            }
          }
        }

        let storedHarthData = localStorage.getItem("harthData");
        if (storedHarthData) {
          try {
            const parsedStoredHarthData = JSON.parse(storedHarthData);
            const matchingHarth = parsedStoredHarthData[comid] || {};

            if (matchingHarth.selected_topic) {
              const matchingTopic = matchingHarth.selected_topic;
              if (matchingTopic) {
                for (let member of matchingTopic.members) {
                  if (member.user_id == user._id) {
                    if (!member.hidden) {
                      startingTopic = matchingTopic;
                    }
                  }
                }
              }
            }
          } catch (error) {
            console.log();
          }
        }
        setSelectedTopic(startingTopic);
      }

      setTopics(topics);
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
    selectedCommRef.current = comm;
  };
  const setCommsFromChild = (comms) => {
    setComms(comms);
  };
  const setTopic = async (topic) => {
    setTopicChange((prevState) => (prevState += 1));
    if (topic && topic._id) {
      let storedData = localStorage.getItem("harthData");

      try {
        storedData = JSON.parse(storedData);
      } catch (error) {
        console.log(error);
        storedData = {};
      }
      if (!storedData) {
        storedData = {};
      }
      storedData[selectedCommRef.current?._id] = {
        ...(storedData[selectedCommRef.current?._id] || {}),
        selected_topic: topic,
      };

      localStorage.setItem("harthData", JSON.stringify(storedData));
    }

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
      /* eslint-disable */
      switch (type) {
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

  const setUnreadConversationMessagesHandler = (incomingMsg) => {
    if (incomingMsg.userIDS?.includes(user?._id || "")) {
      setIncomingConversationMsg(incomingMsg);
    }
  };
  const resetConversations = () => {
    setConversations(null);
    setSelectedConversation(null);
    setConversationMessages(null);
  };
  const resetTopics = () => {
    setTopics(null);
    setSelectedTopic(null);
    setTopicChange(0);
  };
  const changeSelectedCommFromChild = (com) => {
    if (currentPage === "message") {
      fetchConversations(com._id);
      resetTopics();
    }
    if (currentPage === "chat") {
      grabTopics(com._id);
      resetConversations();
    }
    if (currentPage === "gather") {
      resetTopics();
      resetConversations();
    }
    setComm(com);
    setTopic({});
    grabRooms();
  };

  return (
    <CommsContext.Provider
      value={{
        changeSelectedCommFromChild,
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
        selectedCommRef,
        setProfile,
        profileRef: profileRef.current,
        resetConversations,
        resetTopics,
        forceHarthCreation,
        selectedTopicRef,
      }}
    >
      {children}
    </CommsContext.Provider>
  );
};

export const useComms = () => useContext(CommsContext);
