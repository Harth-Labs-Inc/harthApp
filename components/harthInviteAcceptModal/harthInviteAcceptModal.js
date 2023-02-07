import React, { useState } from "react";

import TalkingHead from "../TalkingHead/TalkingHead";
import { Button, Modal } from "../Common";

import { checkIfInviteTokenIsGood } from "../../requests/community";

import styles from "./harthinvite.module.scss";


export default function HarthInviteAcceptModal({
  talkingHeadMsg,
  submitText,
  submitHandler,
  tkn,
  user,
  closeHandler,
  footer,
}) {

  const invitationAcceptHandler = async (e) => {
    e.preventDefault();
    let results = await checkIfInviteTokenIsGood({ token: tkn, user });
    let { ok, harth } = results;
    
    if (ok) {
      submitHandler(harth);
    }
  };

  return (
    <Modal onToggleModal={closeHandler}>
      <div className={styles.mainContainer} >
        <div className={styles.title}>New Härth Invite</div>
        <TalkingHead text={talkingHeadMsg} />
        <div className={styles.harthHolder}>

          {/* Replace with actual logic */}
          <img src="https://dictionary.cambridge.org/us/images/thumb/tree_noun_001_18152.jpg?version=5.0.292" />
          <div className={styles.harthTitle}>Harth Name</div>
          {/* end */}


        </div>
        <form onSubmit={invitationAcceptHandler}>
          <p className={styles.footer}>{footer}</p>
          <div className={styles.buttonBar}>
            <Button tier="primary" fullWidth text={submitText} type="submit" />
            <Button tier="secondary" size="small" text="Don't Accept" onClick={closeHandler} />
          </div>
        </form>
      </div>
    </Modal>
    
  );
}
