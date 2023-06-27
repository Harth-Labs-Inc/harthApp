import { createContext, useState, useContext, useEffect } from "react";
import { useRouter } from "next/router";
import { getUserDataFromToken } from "../requests/userApi";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [Comms, setComms] = useState([]);

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
      if (token) {
        const data = await getUserDataFromToken(token);
        const { ok, user, comms } = data;
        if (ok) {
          setUser(user);
          setLoading(false);
          setComms(comms);
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
