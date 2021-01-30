import React, { useState, useEffect } from "react";
import { getComms } from "../../requests/community";
import { useAuth } from "../../contexts/auth";
import NavLayout from "../../components/navLayout";

const dashboard = (props) => {
  const [comms, setComms] = useState(null);

  const { children } = props;
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

  return (
    // <SocketProvider>
    //   <NavLayout>{children}</NavLayout>
    // </SocketProvider>
    <NavLayout comms={comms}>{children}</NavLayout>
  );
};

export default dashboard;
