import { useComms } from "contexts/comms";
import { useSocket } from "contexts/socket";
import { useEffect } from "react";

import styles from "../ChatMessages/ChatMessages.module.scss";
const NewMessageIcon = () => {
  const { selectedTopic } = useComms();
  const { newMessageIndicators } = useSocket();

  useEffect(() => {
    return () => {
      if (selectedTopic?._id) {
        delete newMessageIndicators[selectedTopic._id];
      }
    };
  }, []);
  return (
    <p
      id="addnewindicator"
      className={styles.ScrollButton}
      style={{ color: "white", margin: "0 auto" }}
    >
      new
    </p>
  );
};

export default NewMessageIcon;
