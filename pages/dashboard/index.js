import React, { useState, useEffect } from "react";
import Router, { useRouter } from "next/router";
import Cookies from "js-cookie";
import { CommsProvider } from "../../contexts/comms";
import { SocketProvider } from "../../contexts/socket";
import { ChatProvider } from "../../contexts/chat";
import NavLayout from "../../components/dashLayout";

import Modal from "../../components/Modal";
import { Button } from "../../components/Common/Button";

import Chat from "./chat";
import Game from "./game";
import Events from "./events";

const dashboard = (props) => {
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState();
  const [currentPage, setCurrentPage] = useState("chat");

  const router = useRouter();
  const {
    query: { tkn },
  } = router;

  useEffect(() => {
    if (tkn) {
      Router.push(`/comm?tkn=${tkn}`);
    } else {
      setLoading(false);
    }
  }, [tkn]);

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
    case "gather":
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
        <CommsProvider>
          <ChatProvider>
            <SocketProvider>
              <NavLayout
                changePage={changePageHandler}
                currentPage={currentPage}
              >
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
            </SocketProvider>
          </ChatProvider>
        </CommsProvider>
      )}
    </>
  );
};

export default dashboard;
