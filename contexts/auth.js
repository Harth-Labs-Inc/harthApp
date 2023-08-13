import { createContext, useState, useContext, useEffect } from "react";
import { useRouter } from "next/router";
import { getUserDataFromToken } from "../requests/userApi";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [Comms, setComms] = useState([]);
  const [Conversations, setConversations] = useState([]);
  const [CREATOR, setCREATOR] = useState(null);
  const [SELECTEDCOMM, setSELECTEDCOMM] = useState(null);
  const [SUBSCRIPTION, setSUBSCRIPTION] = useState(null);

  const [TOPICS, setTOPICS] = useState([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  let { invite, tkn } = router.query;

  const fetchUserFromToken = async (token, reroute) => {
    const prevID = localStorage.getItem("selectedHarthID");
    const selectedPage = localStorage.getItem("selectedPage");
    const deviceKey = localStorage.getItem("deviceKey");

    if (token) {
      const data = await getUserDataFromToken(
        token,
        prevID,
        selectedPage,
        deviceKey
      );
      const {
        ok,
        user,
        comms,
        creator,
        selectedComm,
        topics,
        conversations,
        subscriptions,
      } = data;
      if (ok) {
        setUser(user);
        setLoading(false);
        setComms(comms);
        setCREATOR(creator || {});
        setSELECTEDCOMM(selectedComm || {});
        setTOPICS(topics || []);
        setConversations(conversations || []);
        setSUBSCRIPTION(subscriptions || null);
        if (reroute) {
          router.push("/");
        }
      } else {
        if (!["/auth/createAccount", "/auth/login"].includes(router.pathname)) {
          router.push("/auth/createAccount");
        }

        setLoading(false);
      }
    } else {
      if (!["/auth/createAccount", "/auth/login"].includes(router.pathname)) {
        router.push("/auth/createAccount");
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    if (router.pathname == "/_error") {
      router.push("/");
    }
    const token = localStorage.getItem("token");
    fetchUserFromToken(token);
  }, []);
  useEffect(() => {
    if (invite && tkn) {
      localStorage.setItem("inviteToken", tkn);
    }
  }, [invite, tkn]);

  const setContextUser = (user) => {
    setUser(user);
  };
  const getInitialData = (token) => {
    fetchUserFromToken(token, true);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        user,
        loading,
        setContextUser,
        Comms,
        CREATOR,
        SELECTEDCOMM,
        TOPICS,
        getInitialData,
        Conversations,
        SUBSCRIPTION,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
