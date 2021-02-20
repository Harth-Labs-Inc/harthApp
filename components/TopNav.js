import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/auth";
import Modal from "./Modal";
import CommPrefMenu from "./commPreferenceMenu";
import { useComms } from "../contexts/comms";

const TopNav = (props) => {
  const [modal, setModal] = useState();
  const [communityName, setCommunityName] = useState();
  const [communityId, setCommunityId] = useState();
  const [profileIcon, setProfileIcon] = useState();
  const { pathname } = useRouter();

  const { changePage, currentPage, onModalChange, toggleModal } = props;
  const { user } = useAuth();
  const { comms, setComm, selectedcomm } = useComms();

  const showModal = () => {
    setModal(!modal);
  };

  useEffect(() => {
    if (selectedcomm) {
      setCommunityName(selectedcomm.name);
      setCommunityId(selectedcomm._id);
      selectedcomm.users.forEach((usr) => {
        if (usr.userId === user._id) {
          setProfileIcon(usr.iconKey);
        }
      });
    }
  }, [selectedcomm]);

  useEffect(() => {
    if (!selectedcomm && comms && comms.length > 0) {
      setComm(comms[0]);
    }
  }, [comms]);

  return (
    <>
      {modal ? (
        <Modal
          id="community-preferences"
          show={modal}
          onToggleModal={showModal}
        >
          <CommPrefMenu
            communityName={communityName}
            communityId={communityId}
            onToggleModal={showModal}
          />
        </Modal>
      ) : (
        ""
      )}
      <header id="dash-header">
        <button id="channel" onClick={showModal}>
          {communityName}
        </button>
        <div role="nav" className="top-buttons">
          <button
            role="nav-item"
            id="chat"
            aria-label="Community Topics"
            className={currentPage == "chat" ? "active" : ""}
            onClick={() => {
              changePage("chat");
            }}
          ></button>

          <button
            role="nav-item"
            id="notifications"
            aria-label="Notifications"
            className={currentPage == "notifications" ? "active" : ""}
          ></button>

          <button
            role="nav-item"
            id="games"
            aria-label="Games"
            className={currentPage == "game" ? "active" : ""}
            onClick={() => {
              changePage("game");
            }}
          ></button>

          <button
            role="nav-item"
            id="calendar"
            aria-label="Community Events Calendar"
            className={currentPage == "events" ? "active" : ""}
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
