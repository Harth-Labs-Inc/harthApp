import { useState } from "react";
import VerificationInput from "react-verification-input";

import { Button, BackButton } from "../../../components/Common";
import { getCommFromInvite } from "../../../requests/community";

const JoinCom = (props) => {
    // to be deleted
    return null;
    const { changePage, onCommChange } = props;
    const [errorMessage, setErrorMessage] = useState("");
    const [inviteCode, setInviteCode] = useState();

    const inputChangeHandler = (text) => {
        setInviteCode(text);
    };

    const submitHandler = async () => {
        setErrorMessage("");
        let result = await getCommFromInvite(inviteCode);
        let { ok, comm } = result;
        if (ok) {
            onCommChange(comm.comm_id);
            changePage("profile");
        } else {
            setErrorMessage("Incorrect Code");
        }
    };

    return (
        <div id="join-community">
            <h2>
                <BackButton
                    onClick={() => {
                        changePage("initial");
                    }}
                ></BackButton>
                Join a h&auml;rth
            </h2>
            <p>
                Enter your invite code. Don&apos;t have one? Ask a friend to
                send you one or create your own h&auml;rth.
            </p>
            <p>{errorMessage}</p>
            <VerificationInput placeholder="" onChange={inputChangeHandler} />
            <div className="form-bottom">
                <Button
                    id="community_join"
                    type="submit"
                    text="Next"
                    onClick={submitHandler}
                ></Button>
            </div>
        </div>
    );
};

export default JoinCom;
