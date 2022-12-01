import { useState } from "react";
import VerificationInput from "react-verification-input";
import { verifyOtp, login } from "../../../requests/userApi";
import Cookies from "js-cookie";

const OtpValidator = ({ newUser, currentPage }) => {
    console.log(newUser, "asdfadsf");
    const [inviteCode, setInviteCode] = useState();
    const inputChangeHandler = (text) => {
        setInviteCode(text);
    };

    const handlerSubmit = async () => {
        console.log(inviteCode, newUser);
        let result = await verifyOtp({ inviteCode, newUser });
        console.log(result, "result");
        let { ok } = result;
        if (ok) {
            const data = await login(newUser);
            console.log(data, "login");
            const { ok, msg, tkn } = data;
            if (ok) {
                Cookies.set("token", tkn, { expires: 365 });
                // if (inviteToken) {
                //     window.location.pathname = `/comm?tkn=${inviteToken}`;
                // } else {
                //     window.location.pathname = "/comm";
                // }
                window.location.pathname = "/comm";
            } else {
            }
        }
    };

    return (
        <>
            <VerificationInput placeholder="" onChange={inputChangeHandler} />
            <button type="submit" onClick={handlerSubmit}>
                log in
            </button>
        </>
    );
};

export default OtpValidator;
