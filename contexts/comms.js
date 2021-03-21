import React, { createContext, useState, useContext, useEffect } from "react";
import { getComms, getTopics } from "../requests/community";
import { useAuth } from "./auth";

const CommsContext = createContext({});

export const CommsProvider = ({ children }) => {
  const [comms, setComms] = useState(null);
  const [selectedcomm, setSelectedcomm] = useState(null);
  const [topics, setTopics] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState({});

  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      if (user.comms.length > 0) {
        (async () => {
          let result = await getComms(user);
          const { ok, comms } = result;
          if (ok) {
            setComms(comms);
          }
        })();
      }
    }
  }, [user]);

  useEffect(() => {
    if (selectedcomm) {
      (async () => {
        let result = await getTopics(selectedcomm._id);
        const { ok, topics } = result;
        if (ok) {
          setTopics(topics);
          setSelectedTopic({});
        }
      })();
    }
  }, [selectedcomm]);

  const setComm = async (comm) => {
    setSelectedcomm(comm);
  };
  const setTopic = async (topic) => {
    setSelectedTopic(topic);
  };
  const addNewTopic = (newTopic) => {
    setTopics([...topics, newTopic]);
  };

  return (
    <CommsContext.Provider
      value={{
        comms,
        setComm,
        selectedcomm,
        topics,
        addNewTopic,
        setTopic,
        selectedTopic,
      }}
    >
      {children}
    </CommsContext.Provider>
  );
};

export const useComms = () => useContext(CommsContext);
