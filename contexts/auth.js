import { createContext, useState, useContext, useEffect } from "react";
import { useRouter } from "next/router";
import { getUserDataFromToken } from "../requests/userApi";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [Comms, setComms] = useState([]);
  const [CREATOR, setCREATOR] = useState(null);
  const [SELECTEDCOMM, setSELECTEDCOMM] = useState(null);
  const [TOPICS, setTOPICS] = useState([]);

  const [loading, setLoading] = useState(true);
  const [inviteTKN, setInviteTKN] = useState(null);

  const router = useRouter();
  let { invite, tkn } = router.query;

  useEffect(() => {
    if (router.pathname == "/_error") {
      router.push("/");
    }
    async function fetchUserFromToken() {
      const token = localStorage.getItem("token");
      const prevID = localStorage.getItem("selectedHarthID");
      if (token) {
        const data = await getUserDataFromToken(token, prevID);
        const { ok, user, comms, creator, selectedComm, topics } = data;
        if (ok) {
          setUser(user);
          setLoading(false);
          setComms(comms);
          setCREATOR(creator || {});
          setSELECTEDCOMM(selectedComm || {});
          setTOPICS(topics || []);
        } else {
          if (
            !["/auth/createAccount", "/auth/login"].includes(router.pathname)
          ) {
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
    }

    fetchUserFromToken();
  }, []);
  useEffect(() => {
    if (invite && tkn) {
      setInviteTKN(tkn);
    }
  }, [invite, tkn]);

  const setContextUser = (user) => {
    setUser(user);
  };
  const getInitialData = (token) => {
    async function fetchUserFromToken() {
      const prevID = localStorage.getItem("selectedHarthID");
      if (token) {
        const data = await getUserDataFromToken(token, prevID);
        const { ok, user, comms, creator, selectedComm, topics } = data;
        if (ok) {
          setUser(user);
          setLoading(false);
          setComms(comms);
          setCREATOR(creator || {});
          setSELECTEDCOMM(selectedComm || {});
          setTOPICS(topics || []);
          router.push("/");
        } else {
          if (
            !["/auth/createAccount", "/auth/login"].includes(router.pathname)
          ) {
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
    }
    fetchUserFromToken();
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        user,
        loading,
        inviteTKN,
        setInviteTKN,
        setContextUser,
        Comms,
        CREATOR,
        SELECTEDCOMM,
        TOPICS,
        getInitialData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
