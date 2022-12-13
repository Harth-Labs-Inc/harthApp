import React, { useState } from "react";

// import { addUserToComm, saveCommunity } from "../../requests/community";
// import { useAuth } from "../../contexts/auth";
// import { useComms } from "../../contexts/comms";

import TalkingHead from "../TalkingHead/TalkingHead";
import { Button, Modal } from "../Common";

import { checkIfInviteTokenIsGood } from "../../requests/community";

export default function HarthInviteAcceptModal({
    talkingHeadMsg,
    submitText,
    submitHandler,
    tkn,
}) {
    const invitationAcceptHandler = async (e) => {
        e.preventDefault();
        let results = await checkIfInviteTokenIsGood({ token: tkn });
        console.log(results);
        let { ok, harth } = results;
        if (ok) {
            submitHandler(harth);
        }
    };

    return (
        <Modal>
            <TalkingHead text={talkingHeadMsg} />
            <form onSubmit={invitationAcceptHandler}>
                <p>
                    You have been invited to join this harth by [profile name]
                </p>
                <Button
                    tier="secondary"
                    fullWidth
                    text={submitText}
                    type="submit"
                />
            </form>
        </Modal>
    );
}
