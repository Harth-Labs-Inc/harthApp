import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";

const SideNav = (props) => {
  const { pathname } = useRouter();

  return (
    <aside id="nav_topics">
      {/* <Link href="/chat">
        <a className={pathname == "/chat" ? "active" : ""} aria-label="chat">
          <i className="material-icons grey">chat</i>
        </a>
      </Link> */}
      <Link href="/game">
        <a className={pathname == "/game" ? "active" : ""} aria-label="game">
          <i className="material-icons grey">catching_pokemon</i>
        </a>
      </Link>
      <Link href="/events">
        <a
          className={pathname == "/events" ? "active" : ""}
          aria-label="events"
        >
          <i className="material-icons grey">event</i>
        </a>
      </Link>
      <Link href="/addTopic">
        <a
          className={pathname == "/addTopic" ? "active" : ""}
          aria-label="Add Topic"
        >
          <i className="material-icons grey">plus</i>
        </a>
      </Link>
      <button
        onClick={props.onToggleMenu}
        aria-label="Toggle Main Menu"
        id="menu-toggle"
      >
        <span className="line"></span>
        <span className="line"></span>
        <span className="line"></span>
      </button>
    </aside>
  );
};

export default SideNav;
