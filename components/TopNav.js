import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";

const TopNav = (props) => {
  const { pathname } = useRouter();

  return (
    <header id="dash-header">
      <button id="channel">Moving Targets</button>
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
      <button id="account-btn" aria-label="My Account"></button>
    </header>
  );
};

export default TopNav;
