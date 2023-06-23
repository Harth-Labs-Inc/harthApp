import { createContext, useContext, useState } from "react";

const AuthContext = createContext({});

export const AuthProvider = ({ children, user }) => {
  const [userState, setUserState] = useState(user);
  const setContextUser = (usr) => {
    setUserState(usr);
  };
  return (
    <AuthContext.Provider
      value={{
        user: userState,
        loading: false,
        setContextUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
