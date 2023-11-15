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
  const [newUser, setNewUser] = useState(null);

  const [TOPICS, setTOPICS] = useState([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

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
        setNewUser(null);
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
        if (
          ![
            "/auth/createAccount",
            "/auth/login",
            "/auth/TOS",
            "/auth/welcome",
          ].includes(router.pathname)
        ) {
          router.push("/auth/welcome");
        }

        setLoading(false);
      }
    } else {
      if (
        ![
          "/auth/createAccount",
          "/auth/login",
          "/auth/TOS",
          "/auth/welcome",
        ].includes(router.pathname)
      ) {
        router.push("/auth/welcome");
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    const search = window.location.search;
    const params = new URLSearchParams(search);
    const invite = params.get("invite");
    const tkn = params.get("tkn");

    if (invite && tkn) {
      localStorage.setItem("inviteToken", tkn);
    }

    if (router.pathname == "/_error") {
      router.push("/");
    }
    const token = localStorage.getItem("token");
    fetchUserFromToken(token);
  }, []);

  const setContextUser = (user) => {
    setUser(user);
  };
  const getInitialData = (token) => {
    fetchUserFromToken(token, true);
  };

  return (
    <AuthContext.Provider
      value={{
        newUser,
        setNewUser,
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
