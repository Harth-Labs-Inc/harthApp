import React, { createContext, useState, useContext, useEffect } from "react";
import { getComms } from "../requests/community";
import { useAuth } from "./auth";

const CommsContext = createContext({});

export const CommsProvider = ({ children }) => {
  const [comms, setComms] = useState(null);
  const [selectedcomm, setSelectedcomm] = useState(null);

  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      if (user.comms.length > 0) {
        (async () => {
          let result = await getComms(user);
          const { msg, ok, comms } = result;
          if (ok) {
            setComms(comms);
          }
        })();
      }
    }
  }, [user]);

  const setSelected = async (comm) => {
    setSelectedcomm(comm);
  };

  return (
    <CommsContext.Provider value={{ comms, setSelected, selectedcomm }}>
      {children}
    </CommsContext.Provider>
  );
};

export const useComms = () => useContext(CommsContext);
