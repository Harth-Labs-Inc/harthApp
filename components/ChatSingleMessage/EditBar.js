import { IconDeleteNoFill } from "../../resources/icons/IconDeleteNoFill";
import { IconEditNoFill } from "../../resources/icons/IconEditNoFill";
import { IconAddReactionNoFill } from "../../resources/icons/IconAddReactionNoFill";

import styles from "./ChatSingleMessage.module.scss";
import FlagIcon from "resources/icons/Flag";
import BlockIcon from "resources/icons/Block";

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
  isSuperAdmin,
  blockUserHandler,
  blockName,
}) => {
  if (showEditBar && showEditBar == _id) {
    if (creator_id == user_id || isSuperAdmin) {
      return (
        <div className={styles.Controls}>
          <button value="delete" onClick={deleteMsg} title="delete">
            <IconDeleteNoFill />
          </button>
          {creator_id == user_id ? (
            <button value="edit" onClick={editBarSelection} title="edit">
              <IconEditNoFill />
            </button>
          ) : null}
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
          {creator_id != user_id ? (
            <button value="block" title="block user" onClick={blockUserHandler}>
              <BlockIcon blockName={blockName} />
            </button>
          ) : null}
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
          {creator_id != user_id ? (
            <button value="block" title="block user" onClick={blockUserHandler}>
              <BlockIcon blockName={blockName} />
            </button>
          ) : null}
        </div>
      );
    }
  }

  return null;
};

export default EditBar;
