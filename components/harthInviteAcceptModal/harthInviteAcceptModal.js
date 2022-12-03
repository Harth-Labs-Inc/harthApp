import React, { useState } from "react";
import { addUserToComm, saveCommunity } from "../../requests/community";
import TalkingHead from "../TalkingHead/TalkingHead";
import { useAuth } from "../../contexts/auth";
import { useComms } from "../../contexts/comms";
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
        <div>
            <h1>{header}</h1>
            <TalkingHead text={talkingHeadMsg} />
            <form onSubmit={invitationAcceptHandler}>
                <p>{footer}</p>
                <button>{submitText}</button>
            </form>
        </div>
    );
}
