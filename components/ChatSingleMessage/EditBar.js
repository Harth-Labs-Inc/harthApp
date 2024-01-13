import { useState } from "react";
import { IconDeleteNoFill } from "../../resources/icons/IconDeleteNoFill";
import { IconEditNoFill } from "../../resources/icons/IconEditNoFill";
import { IconAddReactionNoFill } from "../../resources/icons/IconAddReactionNoFill";
import { IconMoreDots } from "resources/icons/IconMoreDots";
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
  const [showMoreButtons, setShowMoreButtons] = useState(false);
  if (showEditBar && showEditBar === _id) {
    const reactionButton = (
      <button value="reaction" title="reaction" onClick={triggerPicker}>
        <IconAddReactionNoFill />
      </button>
    );

    const moreButton = (
      <button
        value="more"
        title="more"
        onClick={() => setShowMoreButtons(true)}
      >
        <IconMoreDots />
      </button>
    );

    const flagButton = disableFLagIcon ? (
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
    );

    const blockButton =
      creator_id !== user_id ? (
        <button value="block" title="block user" onClick={blockUserHandler}>
          <BlockIcon blockName={blockName} />
        </button>
      ) : null;

    return (
      <div className={styles.Controls}>
        {reactionButton}
        {showMoreButtons ? (
          <>
            {(creator_id === user_id || isSuperAdmin) && (
              <button value="delete" onClick={deleteMsg} title="delete">
                <IconDeleteNoFill />
              </button>
            )}
            {creator_id === user_id && (
              <button value="edit" onClick={editBarSelection} title="edit">
                <IconEditNoFill />
              </button>
            )}
            {flagButton}
            {blockButton}
          </>
        ) : (
          moreButton
        )}
      </div>
    );
  }

  return null;
};

export default EditBar;
