import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/auth";
import { useRouter } from "next/router";
import { verifyResetTkn } from "../../requests/userApi";
import InvalidReset from "./../invalidReset";
import ChangePassword from "./changePassword";
import Login from "./login";
import ResetPwd from "./forgotPassword";
import CreateAccount from "./createAccount";

const authIndexPage = () => {
  const [currentPage, setCurrentPage] = useState("login");
  const [animationState, setAnimationState] = useState("");

  const router = useRouter();
  const { user } = useAuth();

  const {
    query: { tkn },
  } = router;

  useEffect(() => {
    if (tkn) {
      validate();
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

  useEffect(() => {
    if (user) window.location.pathname = "/dashboard";
  }, [user]);

  const changePageHandler = (pg) => {
    if (currentPage == "login" && pg == "createaccount") {
      setAnimationState("center-left");
    } else if (currentPage == "login" && pg == "resetpwd") {
      setAnimationState("center-right");
    } else if (currentPage == "resetpwd" && pg == "login") {
      setAnimationState("center-right");
    } else if (currentPage == "createaccount" && pg == "login") {
      setAnimationState("center-left");
    }
    setTimeout(() => {
      setCurrentPage(pg);

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

  let page;
  switch (currentPage) {
    case "resetpwd":
      page = <ResetPwd changePage={changePageHandler}></ResetPwd>;
      break;
    case "createaccount":
      page = <CreateAccount changePage={changePageHandler}></CreateAccount>;
      break;
    case "updatePwd":
      page = (
        <ChangePassword
          changePage={changePageHandler}
          tkn={tkn}
        ></ChangePassword>
      );
      break;
    case "resetInvalid":
      page = <InvalidReset changePage={changePageHandler}></InvalidReset>;
      break;
    default:
      page = (
        <Login
          animationClass={animationState}
          changePage={changePageHandler}
        ></Login>
      );
      break;
  }

  return <>{page}</>;
};

export default authIndexPage;
