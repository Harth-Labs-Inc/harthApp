import { IconDeleteNoFill } from "../../resources/icons/IconDeleteNoFill";
import { IconEditNoFill } from "../../resources/icons/IconEditNoFill";
import { IconAddReactionNoFill } from "../../resources/icons/IconAddReactionNoFill";

import styles from "./ChatSingleMessage.module.scss";
import FlagIcon from "resources/icons/Flag";

const EditBar = ({
  showEditBar,
  _id,
  creator_id,
  user_id,
  deleteMsg,
  editBarSelection,
  triggerPicker,
  flagMessageHandler,
  disableFLagIcon,
}) => {
  if (showEditBar && showEditBar == _id) {
    if (creator_id == user_id) {
      return (
        <div className={styles.Controls}>
          <button value="delete" onClick={deleteMsg} title="delete">
            <IconDeleteNoFill />
          </button>
          <button value="edit" onClick={editBarSelection} title="edit">
            <IconEditNoFill />
          </button>
          <button value="reaction" title="reaction" onClick={triggerPicker}>
            <IconAddReactionNoFill />
          </button>
          {disableFLagIcon ? (
            <button
              disabled
              value="flag"
              title="flag"
              onClick={flagMessageHandler}
              className={styles.disabledFlag}
            >
              <FlagIcon />
            </button>
          ) : (
            <button value="flag" title="flag" onClick={flagMessageHandler}>
              <FlagIcon />
            </button>
          )}
        </div>
      );
    } else {
      return (
        <div className={styles.Controls}>
          <button value="reaction" title="reaction" onClick={triggerPicker}>
            <IconAddReactionNoFill />
          </button>
          {disableFLagIcon ? (
            <button
              className={styles.disabledFlag}
              disabled
              value="flag"
              title="flag"
              onClick={flagMessageHandler}
            >
              <FlagIcon />
            </button>
          ) : (
            <button value="flag" title="flag" onClick={flagMessageHandler}>
              <FlagIcon />
            </button>
          )}
        </div>
      );
    }
  }

  return null;
};

export default EditBar;
