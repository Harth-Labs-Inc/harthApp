import Link from "next/link";
import Router, { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/auth";
import Modal from "./Modal";
import CommPrefMenu from "./commPreferenceMenu";

const TopNav = (props) => {
  const [modal, setModal] = useState();
  const [communityName, setCommunityName] = useState();
  const [communityId, setCommunityId] = useState();
  const [profileIcon, setProfileIcon] = useState();
  const { pathname } = useRouter();

  const { changePage, onModalChange, toggleModal, comms } = props;
  const { user } = useAuth();

  const showModal = () => {
    setModal(!modal);
  };

  useEffect(() => {
    if (comms && comms.length > 0) {
      setCommunityName(comms[0].name);
      setCommunityId(comms[0]._id);
      comms[0].users.forEach((usr) => {
        if (usr.userId === user._id) {
          setProfileIcon(usr.iconKey);
        }
      });
      console.log(user._id);
    }
  }, [comms]);

  return (
    <>
      {" "}
      {modal ? (
        <Modal
          id="community-preferences"
          show={modal}
          onToggleModal={showModal}
        >
          <CommPrefMenu
            communityName={communityName}
            communityId={communityId}
          />
        </Modal>
      ) : (
        ""
      )}{" "}
      <header id="dash-header">
        <button id="channel" onClick={showModal}>
          {communityName}
        </button>
        <div role="nav" className="top-buttons">
          <button
            role="nav-item"
            id="chat"
            aria-label="Community Topics"
            className={pathname == "/chat" ? "active" : ""}
            onClick={() => {
              changePage("chat");
            }}
          ></button>

          <button
            role="nav-item"
            id="notifications"
            aria-label="Notifications"
            className={pathname == "/notifications" ? "active" : ""}
          ></button>

          <button
            role="nav-item"
            id="games"
            aria-label="Games"
            className={pathname == "/game" ? "active" : ""}
            onClick={() => {
              changePage("game");
            }}
          ></button>

          <button
            role="nav-item"
            id="calendar"
            aria-label="Community Events Calendar"
            className={pathname == "/events" ? "active" : ""}
            onClick={() => {
              changePage("events");
            }}
          ></button>
        </div>
        <button
          id="account-btn"
          aria-label="My Account"
          className={profileIcon ? "hasImage" : ""}
        >
          {profileIcon ? <img src={profileIcon} /> : ""}
        </button>
      </header>
    </>
  );
};

export default TopNav;
