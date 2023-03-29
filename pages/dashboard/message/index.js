import { useContext, useEffect } from "react";
import { ConversationMessages } from "../../../components/Conversations/ConversationMessages";
import { MobileContext } from "../../../contexts/mobile.js";
import ConversationsNav from "../../../components/Menus/ConversationMenu/ConversationsNav";
import styles from "./messagePage.module.scss";

const Message = () => {
  const { isMobile } = useContext(MobileContext);

  useEffect(() => {
    const element = document.getElementById("mainmessageContainer");
    element.classList.add(styles.rendering);
    setTimeout(() => {
      element.classList.remove(styles.rendering);
      element.classList.add(styles.entered);
    }, 100);

    return () => {
      element.classList.remove(styles.entered);
      element.classList.remove(styles.rendering);
    };
  }, []);

  return (
    <>
      {isMobile ? (
        <>
          <div
            id="mainmessageContainer"
            style={{ width: "100%", position: "relative" }}
          >
            <div className={styles.topicHolderMobile}>
              <ConversationsNav />
            </div>
          </div>
        </>
      ) : (
        <div id="mainmessageContainer">
          <ConversationsNav />
          <ConversationMessages />
        </div>
      )}
    </>
  );
};

export default Message;
