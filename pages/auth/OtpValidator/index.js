import { useState } from "react";
import VerificationInput from "react-verification-input";
import Cookies from "js-cookie";
import { useRouter } from "next/router";

import { verifyOtp, login } from "../../../requests/userApi";
import TalkingHead from "../../../components/TalkingHead/TalkingHead";
import { HarthLogoDark } from "../../../public/images/harth-logo-dark";
import { Wizard } from "../../../resources/icons/wizard";
import styles from "./otpValidator.module.scss";

const URLS = {
    development: "http://localhost:3000/",
    production: "https://project-blarg-next.vercel.app/",
};

const OtpValidator = ({ newUser, currentPage }) => {
    console.log(newUser, "asdfadsf");

    const router = useRouter();

    const [inviteCode, setInviteCode] = useState();
    const [helpText, setHelpText] = useState(
        "I have sent you a secret code. Enter it below and an account is yours."
    );
    const inputChangeHandler = (text) => {
        setInviteCode(text);
    };

    const handlerSubmit = async () => {
        let result = await verifyOtp({ inviteCode, newUser });
        let { ok } = result;
        if (ok) {
            const data = await login(newUser);
            const { ok, msg, tkn } = data;
            if (ok) {
                Cookies.set("token", tkn, { expires: 365 });
                if (newUser.showFirstTimeUser) {
                    Cookies.set("showFirstTimeUser", true);
                }
                router.reload();
            }
        } else {
            setHelpText(
                "HALT!!" + <br /> + "The code you entered was not correct."
            );
        }
    };

    if (!newUser) {
        return <p>...Loading</p>;
    }

    return (
        <div className={styles.OtpModule}>
            <TalkingHead text={helpText} />
            <p>Enter the security code we just sent to {newUser?.email}</p>
            <VerificationInput placeholder="" onChange={inputChangeHandler} />
            <button type="submit" onClick={handlerSubmit}>
                log in
            </button>
            <button type="button">Start over</button>
            <button type="button">Resend the code</button>
        </div>
    );
};

export default OtpValidator;
