import React, { useState } from "react";

import TalkingHead from "../TalkingHead/TalkingHead";

export default function CreateHarthName({
    header,
    talkingHeadMsg,
    footer,
    placeholder,
    submitText,
    submitHandler,
}) {
    const [harthName, setHarthName] = useState("");

    const handleInputChange = (e) => {
        const { value } = e.target;
        setHarthName(value);
    };
    const createNewHarth = (e) => {
        e.preventDefault();
        let newHarth = {
            name: harthName,
            iconKey: "",
            users: [],
            topics: [],
        };
        submitHandler(newHarth);
    };

    return (
        <div>
            <h1>{header}</h1>
            <TalkingHead text={talkingHeadMsg} />
            <form onSubmit={createNewHarth}>
                <input
                    placeholder={placeholder}
                    type="text"
                    value={harthName}
                    onInput={handleInputChange}
                    required
                />
                <p>{footer}</p>
                <button>{submitText}</button>
            </form>
        </div>
    );
}
