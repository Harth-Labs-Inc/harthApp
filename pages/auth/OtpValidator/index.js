import { useEffect, useState } from "react";
import VerificationInput from "react-verification-input";
import { HarthLogoDark } from "../../../public/images/harth-logo-dark";
import Cookies from "js-cookie";
import { useRouter } from "next/router";

import { verifyOtp, login } from "../../../requests/userApi";
import TalkingHead from "../../../components/TalkingHead/TalkingHead";
import CodeInput from "../../../components/CodeInput/CodeInput";
import { Button } from "../../../components/Common";
import styles from "./otpValidator.module.scss";

const URLS = {
    development: "http://localhost:3000/",
    production: "https://project-blarg-next.vercel.app/",
};

const OtpValidator = (props) => {
    const { newUser, changePage, inviteToken, currentPage } = props;
    console.log(newUser, "asdfadsf");

    const router = useRouter();

    const [inviteCode, setInviteCode] = useState();
    const [helpText, setHelpText] = useState(
        "Enter your secret code below to pass."
    );
    const inputChangeHandler = (text) => {
        setInviteCode(text);
    };

    useEffect(() => {
        if (inviteCode?.length === 6) {
            handlerSubmit();
        }
    }, [inviteCode]);

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
            <div className={styles.OtpModuleLogo}>
                <HarthLogoDark />
            </div>
            <TalkingHead text={helpText} />
            <p className={styles.OtpModuleText}>
                Enter the security code we just sent to {newUser?.email}
            </p>
            <CodeInput onChange={inputChangeHandler} />
            <p className={styles.OtpModuleSubText}>
                Didn't get the code? Check your spam folder.
            </p>
            {/* <button type="submit" onClick={handlerSubmit}>
                log in
            </button> */}
            <div className={styles.OtpModuleButtons}>
                <Button 
                    tier="secondary"  
                    size="small" 
                    text="Start over" 
                    onClick={() => {
                        changePage("login");
                    }}
                />
                <Button tier="secondary" size="small" text="Resend the code" />
            </div>
        </div>
    );
};

export default OtpValidator;
