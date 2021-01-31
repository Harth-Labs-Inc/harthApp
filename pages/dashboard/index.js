import React, { useState, useEffect } from "react";
import Router, { useRouter } from "next/router";
import Cookies from "js-cookie";
import { getComms } from "../../requests/community";
import { useAuth } from "../../contexts/auth";
import NavLayout from "../../components/navLayout";

import Modal from "../../components/Modal";
import { Button } from "../../components/Button";

import Chat from "./chat";
import Game from "./game";
import Events from "./events";

const dashboard = (props) => {
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState();
  const [currentPage, setCurrentPage] = useState("chat");
  const [comms, setComms] = useState(null);

  const { user } = useAuth();
  const router = useRouter();
  const {
    query: { tkn },
  } = router;

  useEffect(() => {
    if (tkn) {
      Router.push("/comm");
    } else {
      setLoading(false);
    }
  }, [tkn]);

  useEffect(() => {
    if (user) {
      if (user.comms.length > 0) {
        (async () => {
          let result = await getComms(user);
          const { msg, ok, comms } = result;
          if (ok) {
            setComms(comms);
          }
        })();
      }
    }
  }, [user]);

  useEffect(() => {
    let ck = Cookies.get("showComCreatedModal");
    if (ck) setModal(true);
  }, []);

  const changePageHandler = (pg) => {
    setCurrentPage(pg);
  };

  const showModal = () => {
    setModal(!modal);
  };

  const removeCookie = () => {
    Cookies.remove("showComCreatedModal");
    showModal();
  };

  let page;
  switch (currentPage) {
    case "game":
      page = <Game></Game>;
      break;
    case "events":
      page = <Events></Events>;
      break;
    default:
      page = <Chat></Chat>;
      break;
  }

  return (
    <>
      {loading ? (
        ""
      ) : (
        <NavLayout comms={comms} changePage={changePageHandler}>
          {modal ? (
            <Modal
              id="community-preferences"
              show={modal}
              onToggleModal={showModal}
            >
              <h1>Success!!</h1>
              <p>Welcome to your new community.</p>
              <p>We hope you have a great time</p>
              <Button text="let's go" onClick={removeCookie}></Button>
            </Modal>
          ) : (
            ""
          )}
          {page}
        </NavLayout>
      )}
    </>
  );
};

export default dashboard;
