import React, { useState } from "react";
import { addUserToComm, saveCommunity } from "../../requests/community";
import TalkingHead from "../TalkingHead/TalkingHead";
import { useAuth } from "../../contexts/auth";
import { useComms } from "../../contexts/comms";

export default function CreateHarthProfile({
    header,
    talkingHeadMsg,
    footer,
    placeholder,
    submitText,
    submitHandler,
    harth,
    invite,
}) {
    const [profileName, setProfileName] = useState("");
    const { refetchComms } = useComms();
    const { user } = useAuth();

    const handleInputChange = (e) => {
        const { value } = e.target;
        setProfileName(value);
    };
    const joinHarthHandler = async (e) => {
        e.preventDefault();
        console.log(harth);
        let id;
        if (!invite) {
            let commDbUpload = await saveCommunity(harth);
            if (commDbUpload.ok) {
                id = commDbUpload.id;
            }
        } else if (harth._id) {
            id = harth._id;
        }
        await addUserToComm(id, {
            userId: user._id,
            iconKey: "",
            name: profileName,
            personalInfo: {},
        });

        refetchComms();
        submitHandler();
    };

    return (
        <div>
            <h1>{header}</h1>
            <TalkingHead text={talkingHeadMsg} />
            <form onSubmit={joinHarthHandler}>
                <input
                    placeholder={placeholder}
                    type="text"
                    value={profileName}
                    onInput={handleInputChange}
                    required
                />
                <p>{footer}</p>
                <button>{submitText}</button>
            </form>
        </div>
    );
}
