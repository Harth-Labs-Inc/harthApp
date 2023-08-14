import { createContext, useState, useContext, useEffect, useRef } from "react";
import {
  getComms,
  getTopics,
  updatedTopic,
  updateHarthData,
} from "../requests/community";
import { getConversations } from "../requests/conversations";
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
  const [incomingConversationMsg, setIncomingConversationMsg] = useState({});
  const [incomingConversationMsgUpdate, setIncomingConversationMsgUpdate] =
    useState({});
  const [hasRoomMinimized, setHasRoomMinimized] = useState(false);
  const [openMinimizedRoom, setOpenMinimizedRoom] = useState(false);
  const [activeRoom, setActiveRoom] = useState(null);
  const [isLoadingTopics, setIsLoadingTopics] = useState(null);
  const [isLoadingConversations, setIsLoadingConversations] = useState(null);

  const { user } = useAuth();

  const selectedCommRef = useRef(SELECTEDCOMM);
  const profileRef = useRef(CREATOR);
  const selectedTopicRef = useRef({});

  const { isMobile } = useContext(MobileContext);

  const router = useRouter();
  const {
    query: { gather_window, openFromPush },
  } = router;

  useEffect(() => {
    try {
      const storedActiveRoom = sessionStorage.getItem("active_room");
      const parsedRoom = JSON.parse(storedActiveRoom);
      if (parsedRoom) {
        setActiveRoom(parsedRoom);
        if (parsedRoom.isMinimized) {
          setHasRoomMinimized(true);
        }
      }
    } catch (error) {
      console.log(error);
    }
  }, []);

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
      let startingConv;

      startingConv = conversations[0];

      if (openFromPush && router.query.conversation_id) {
        const matchingConv = conversations.find(
          ({ _id }) => _id == router.query.conversation_id
        );
        if (matchingConv) {
          startingConv = matchingConv;
        }
      }
      setSelectedConversation(startingConv);
    }
  }, [conversations, isMobile]);

  useEffect(() => {
    profileRef.current = profile;
  }, [profile, setProfile]);

  useEffect(() => {
    selectedTopicRef.current = selectedTopic;
  }, [selectedTopic]);

  useEffect(() => {
    if (openFromPush && comms && comms.length) {
      const { comm_id } = router.query;
      const harth = comms.find(({ _id }) => _id === comm_id);
      if (harth) {
        changeSelectedCommFromChild(harth);
      }
    }
  }, [openFromPush, comms]);

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
            changeSelectedCommFromChild(newCom);
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
    setIsLoadingConversations(true);
    let result = await getConversations(comid, user._id);
    const { ok, conversations } = result;
    if (ok) {
      let startingConv;

      if (!isMobile) {
        startingConv = conversations[0];
      }

      if (openFromPush && router.query.conversation_id) {
        const matchingConv = conversations.find(
          ({ _id }) => _id == router.query.conversation_id
        );
        if (matchingConv) {
          startingConv = matchingConv;
        }
      }
      setConversations(conversations);

      if (startingConv) {
        setSelectedConversation(startingConv);
      }
      setIsLoadingConversations(false);
    }
    return;
  };

  const grabTopics = async (comid) => {
    setIsLoadingTopics(true);
    let result = await getTopics(comid, user._id);
    const { ok, topics } = result;
    if (ok) {
      let startingTopic;
      if (!isMobile) {
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
      }
      if (openFromPush && router.query.topic_id) {
        const matchingTopic = topics.find(
          ({ _id }) => _id == router.query.topic_id
        );
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
      setTopics(topics);
      setIsLoadingTopics(false);
      if (startingTopic) {
        setSelectedTopic(startingTopic);
      }
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
  const setIncomingConversationMessagesHandler = (incomingMsg) => {
    if (incomingMsg.userIDS?.includes(user?._id || "")) {
      setIncomingConversationMsg(incomingMsg);
    }
  };
  const resetConversations = () => {
    setConversations(null);
    setSelectedConversation(null);
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
  const openMobileRoom = (data) => {
    let closeExisting = document.getElementById("mobile_minimized_closer");
    if (closeExisting) {
      closeExisting.click();
    }

    setTimeout(() => {
      sessionStorage.setItem("active_room", JSON.stringify(data));
      setHasRoomMinimized(false);
      setActiveRoom(data);
    }, 100);
  };
  const handleOpenMInimizedRoom = () => {
    clearMinimized();
    setOpenMinimizedRoom(true);
  };
  const clearMinimized = () => {
    const storedActiveRoom = sessionStorage.getItem("active_room");
    try {
      const parsedRoom = JSON.parse(storedActiveRoom);
      parsedRoom.isMinimized = false;
      sessionStorage.setItem("active_room", JSON.stringify(parsedRoom));
    } catch (error) {
      console.log(error);
    }
    setHasRoomMinimized(false);
  };
  const closeActiveRoomFromMobile = () => {
    sessionStorage.removeItem("active_room");
    setActiveRoom(null);
    setHasRoomMinimized(false);
  };
  const minimizeHandler = () => {
    const storedActiveRoom = sessionStorage.getItem("active_room");
    try {
      const parsedRoom = JSON.parse(storedActiveRoom);
      parsedRoom.isMinimized = true;
      sessionStorage.setItem("active_room", JSON.stringify(parsedRoom));
    } catch (error) {
      console.log(error);
    }
    setHasRoomMinimized(true);
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
        fetchConversations,
        setIncomingConversationMsg,
        incomingConversationMsg,
        setIncomingConversationMessagesHandler,
        setIncomingConversationMsgUpdate,
        incomingConversationMsgUpdate,
        selectedCommRef,
        setProfile,
        profileRef: profileRef.current,
        resetConversations,
        resetTopics,
        forceHarthCreation,
        selectedTopicRef,
        setHasRoomMinimized,
        hasRoomMinimized,
        handleOpenMInimizedRoom,
        openMinimizedRoom,
        clearMinimized,
        openMobileRoom,
        closeActiveRoomFromMobile,
        minimizeHandler,
        activeRoom,
        isLoadingTopics,
        isLoadingConversations,
      }}
    >
      {children}
    </CommsContext.Provider>
  );
};

export const useComms = () => useContext(CommsContext);
