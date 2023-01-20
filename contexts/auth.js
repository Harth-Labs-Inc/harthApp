import React, { createContext, useState, useContext, useEffect } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import { getUserFromToken } from "../requests/userApi";
import Loading from "../pages/loading";
import Auth from "../pages/auth";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inviteTKN, setInviteTKN] = useState(null);

  const router = useRouter();
  let { invite, tkn } = router.query;

  useEffect(() => {
    if (router.pathname == "/_error") {
      router.push("/");
    }
    async function fetchUserFromToken() {
      const token = Cookies.get("token");
      if (token) {
        const data = await getUserFromToken(token);
        const { ok, user } = data;
        if (ok) {
          setUser(user);
          setLoading(false);
        } else {
          setLoading(false);
        }
      } else {
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
