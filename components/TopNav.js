import Link from "next/link";
import Router, { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/auth";
import Modal from "./Modal";

const TopNav = (props) => {
  const [modal, setModal] = useState();
  const [communityName, setCommunityName] = useState();
  const [profileIcon, setProfileIcon] = useState();
  const { pathname } = useRouter();

  const { onModalChange, toggleModal, comms } = props;
  const { user } = useAuth();

  const showModal = () => {
    setModal(!modal);
  };

  useEffect(() => {
    if (comms && comms.length > 0) {
      setCommunityName(comms[0].name);
      comms[0].users.forEach((usr) => {
        if (usr.userId === user._id) {
          setProfileIcon(usr.iconKey);
        }
      });
      console.log(user._id);
    }
  }, [comms]);

  return (
    <header id="dash-header">
      <button id="channel" onClick={showModal}>
        {communityName}
      </button>
      <div role="nav" className="top-buttons">
        <Link href="/chat">
          <a
            role="nav-item"
            id="chat"
            aria-label="Community Topics"
            className={pathname == "/chat" ? "active" : ""}
          ></a>
        </Link>
        <Link href="/notifications">
          <a
            role="nav-item"
            id="notifications"
            aria-label="Notifications"
            className={pathname == "/notifications" ? "active" : ""}
          ></a>
        </Link>
        <Link href="/game">
          <a
            role="nav-item"
            id="games"
            aria-label="Games"
            className={pathname == "/game" ? "active" : ""}
          ></a>
        </Link>
        <Link href="/events">
          <a
            role="nav-item"
            id="calendar"
            aria-label="Community Events Calendar"
            className={pathname == "/events" ? "active" : ""}
          ></a>
        </Link>
      </div>
      <button
        id="account-btn"
        aria-label="My Account"
        className={profileIcon ? "hasImage" : ""}
      >
        {profileIcon ? <img src={profileIcon} /> : ""}
      </button>

      {modal ? (
        <Modal
          id="community-preferences"
          show={modal}
          onToggleModal={showModal}
        >
          <div className="modal_top">
            <p>[Community Name] Preferences</p>
            <button aria-label="Close Modal" onClick={showModal}></button>
          </div>
        </Modal>
      ) : (
        ""
      )}
    </header>
  );
};

export default TopNav;
