import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";

const SideNav = () => {
  const { pathname } = useRouter();

  return (
    <aside id="dash-side">
      <Link href="/chat">
        <a className={pathname == "/chat" ? "active" : ""} aria-label="chat">
          <i className="material-icons grey">chat</i>
        </a>
      </Link>
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
      <Link href="/search">
        <a
          className={pathname == "/search" ? "active" : ""}
          aria-label="search"
        >
          <i className="material-icons grey">search</i>
        </a>
      </Link>
    </aside>
  );
};

export default SideNav;
