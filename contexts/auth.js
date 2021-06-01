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

  useEffect(async () => {
    const token = Cookies.get("token");
    if (token) {
      const data = await getUserFromToken(token);
      const { msg, ok, user } = data;
      if (ok) {
        setUser(user);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!user, user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export const ProtectRoute = ({ children }) => {
  const { pathname } = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return <Loading path={pathname} />;
  } else if (!isAuthenticated && pathname !== "/") {
    return <Auth />;
  }
  return children;
};
