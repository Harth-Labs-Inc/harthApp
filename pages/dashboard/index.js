import React, { useState, useEffect } from "react";
import { getComms } from "../../requests/community";
import { useAuth } from "../../contexts/auth";
import NavLayout from "../../components/navLayout";

import Chat from "./chat";
import Game from "./game";
import Events from "./events";

const dashboard = (props) => {
  const [currentPage, setCurrentPage] = useState("chat");
  const [comms, setComms] = useState(null);

  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      console.log(user);
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

  const changePageHandler = (pg) => {
    setCurrentPage(pg);
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
    // <SocketProvider>
    //   <NavLayout>{children}</NavLayout>
    // </SocketProvider>
    <NavLayout comms={comms} changePage={changePageHandler}>
      {page}
    </NavLayout>
  );
};

export default dashboard;
