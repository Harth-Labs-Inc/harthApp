import React, { useState } from "react";

import { addUserToComm, saveCommunity } from "../../requests/community";
import { useAuth } from "../../contexts/auth";
import { useComms } from "../../contexts/comms";
import Modal from "../Modal";
import TalkingHead from "../TalkingHead/TalkingHead";
import { Button } from "../Common";

import { checkIfInviteTokenIsGood } from "../../requests/community";

export default function HarthInviteAcceptModal({
    header,
    talkingHeadMsg,
    footer,
    submitText,
    submitHandler,
    tkn,
}) {
    const invitationAcceptHandler = async (e) => {
        e.preventDefault();
        console.log(tkn);
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
