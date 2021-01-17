import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/auth";
import Login from "../../components/Login";
import ResetPwd from "../../components/ResetPwd";
import CreateAccount from "../../components/CreateAccount";

const authIndexPage = (props) => {
  const [currentPage, setCurrentPage] = useState("login");
  const [animationState, setAnimationState] = useState("");

  const { user } = useAuth();

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
