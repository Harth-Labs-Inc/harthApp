import { createContext, useContext } from "react";
import { useRouter } from "next/router";
import { getUserFromToken } from "../requests/userApi";

const AuthContext = createContext({});

export const AuthProvider = ({ children, user }) => {
  return (
    <AuthContext.Provider
      value={{
        user,
        loading: false,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

// import { createContext, useState, useContext, useEffect } from "react";
// import { useRouter } from "next/router";
// import { getUserFromToken } from "../requests/userApi";

// const AuthContext = createContext({});

// export const AuthProvider = ({ children, user }) => {
//   //   const [user, setUser] = useState(userObj);
//   //   const [loading, setLoading] = useState(false);
//   //   const [inviteTKN, setInviteTKN] = useState(null);

//   //   const router = useRouter();
//   //   let { invite, tkn } = router.query;

//   //   useEffect(() => {
//   //     if (invite && tkn) {
//   //       console.log("token");
//   //       setInviteTKN(tkn);
//   //     }
//   //   }, [invite, tkn]);

//   //   const setContextUser = (user) => {
//   //     console.log("setting user");
//   //     setUser(user);
//   //   };

//   //   console.log(user, "users");
//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         // loading,
//         // inviteTKN,
//         // setInviteTKN,
//         // setContextUser,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => useContext(AuthContext);
