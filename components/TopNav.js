import React from "react";

const TopNav = (props) => {
  return (
    <header id="dash-header">
      <button
        onClick={props.onToggleMenu}
        aria-label="Toggle Main Menu"
        id="menu-toggle"
      >
        <span className="line"></span>
        <span className="line"></span>
        <span className="line"></span>
      </button>
      <p id="channel">Moving Targets</p>
      <div className="top-buttons">
        <button id="messages" aria-label="Messages">
          <i className="material-icons white">forum</i>
        </button>
        <button id="notifications" aria-label="Notifications">
          <i className="material-icons white">notifications</i>
        </button>
        <button id="account" aria-label="My Account">
          <i className="material-icons white">person</i>
        </button>
      </div>
    </header>
  );
};

export default TopNav;
