import React, { useState } from "react";

import TalkingHead from "../TalkingHead/TalkingHead";
import { Button, Modal } from "../Common";

import { checkIfInviteTokenIsGood } from "../../requests/community";

export default function HarthInviteAcceptModal({
  talkingHeadMsg,
  submitText,
  submitHandler,
  tkn,
  user,
  closeHandler,
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
      <TalkingHead text={talkingHeadMsg} />
      <form onSubmit={invitationAcceptHandler}>
        <p>You have been invited to join this harth by [profile name]</p>
        <Button tier="secondary" fullWidth text={submitText} type="submit" />
      </form>
    </Modal>
  );
}
