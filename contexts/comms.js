import React, { createContext, useState, useContext, useEffect } from "react";
import { getComms, getTopics } from "../requests/community";
import { useAuth } from "./auth";

const CommsContext = createContext({});

export const CommsProvider = ({ children }) => {
  const [comms, setComms] = useState(null);
  const [selectedcomm, setSelectedcomm] = useState(null);
  const [topics, setTopics] = useState({});
  const [selectedTopic, setSelectedTopic] = useState(null);

  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      if (user.comms.length > 0) {
        (async () => {
          let commsResult = await getComms(user);
          const { ok, comms } = commsResult;
          if (ok) {
            setComms(comms);

            let tempTopics = {};
            comms.forEach((com) => {
              if (!tempTopics[com._id]) {
                tempTopics[com._id] = [];
              }
              tempTopics[com._id] = com.topics;
            });
            let topicsResult = await getTopics(tempTopics);
            const { ok, topics } = topicsResult;
            if (ok) {
              setTopics(topics);
            }
          }
        })();
      }
    }
  }, [user]);

  const setComm = async (comm) => {
    setSelectedcomm(comm);
  };
  const setTopic = async (comm) => {
    setSelectedTopic(comm);
  };

  return (
    <CommsContext.Provider
      value={{ comms, setComm, selectedcomm, topics, setTopic, selectedTopic }}
    >
      {children}
    </CommsContext.Provider>
  );
};

export const useComms = () => useContext(CommsContext);
