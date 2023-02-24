import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { verifyResetTkn } from "../../requests/userApi";
import Login from "./login";

const AuthIndexPage = () => {
  const [currentPage, setCurrentPage] = useState();
  const [animationState, setAnimationState] = useState("");
  const [inviteToken, setInviteToken] = useState();
  const [newUser, setNewUser] = useState(null);

  const router = useRouter();

  const {
    query: { tkn, invite, reset },
  } = router;

  useEffect(() => {
    if (tkn) {
      if (invite) {
        setInviteToken(tkn);
        setCurrentPage("login");
      }
      if (reset) {
        validate();
      }
    } else {
      setCurrentPage("login");
    }

    async function validate() {
      const data = await verifyResetTkn(tkn);
      const { ok } = data;
      if (ok) {
        setCurrentPage("updatePwd");
      } else {
        setCurrentPage("resetInvalid");
      }
    }
  }, [tkn]);

  const changePageHandler = (pg, user) => {
    if (currentPage == "login" && pg == "createaccount") {
      setAnimationState("center-left");
    } else if (currentPage == "login" && pg == "resetpwd") {
      setAnimationState("center-right");
    } else if (currentPage == "resetpwd" && pg == "login") {
      setAnimationState("center-right");
    } else if (currentPage == "createaccount" && pg == "login") {
      setAnimationState("center-left");
    } else if (currentPage == "createaccount" && pg == "validateopt") {
      setAnimationState("center-left");
    }
    setTimeout(() => {
      setCurrentPage(pg);
      if (user) {
        setNewUser(user);
      }

      setTimeout(() => {
        if (
          animationState === "center-left" ||
          animationState === "center-right"
        ) {
          setAnimationState("");
        }
      }, 4);
    }, 500);
  };

  return (
    <Login
      animationClass={animationState}
      changePage={changePageHandler}
      inviteToken={inviteToken}
      currentPage={currentPage}
    ></Login>
  );
};

export default AuthIndexPage;
