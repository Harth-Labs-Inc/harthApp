import { useEffect, useState } from "react";
import VerificationInput from "react-verification-input";
import { HarthLogoDark } from "../../../public/images/harth-logo-dark";
import Cookies from "js-cookie";
import { useRouter } from "next/router";

import { useAuth } from "../../../contexts/auth";
import {
  verifyOtp,
  login,
  sendOtpEmailToUser,
} from "../../../requests/userApi";
import TalkingHead from "../../../components/TalkingHead/TalkingHead";
import CodeInput from "../../../components/CodeInput/CodeInput";
import { Button } from "../../../components/Common";
import styles from "./otpValidator.module.scss";

const URLS = {
  development: "http://localhost:3000/",
  production: "https://harth.vercel.app/",
};

const OtpValidator = (props) => {
  const { changePage, inviteToken, currentPage } = props;
  const [newUser, setNewUser] = useState();
  const [hasResent, setHasResent] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const router = useRouter();
  const { user } = router.query;

  const { setContextUser } = useAuth();

  useEffect(() => {
    if (user) {
      setNewUser(JSON.parse(user));
    }
  }, [user]);

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
        setContextUser(newUser);
        router.push("/dashboard");
      }
    } else {
      setHelpText("HALT!!" + <br /> + "The code you entered was not correct.");
    }
  };
  const resendOTP = async () => {
    setIsResending(true);
    await sendOtpEmailToUser({ user: newUser, subject: "Email Verification" });
    setHasResent(true);
    setIsResending(false);
  };

  if (!newUser || isResending) {
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
      {hasResent ? (
        <>
          <p className={styles.OtpModuleSubText}>Your code has been resent.</p>
          <p className={styles.OtpModuleSubText}>
            Please wait up to 15 minutes for your code to arrive and remember to
            check your spam folder.
          </p>
        </>
      ) : (
        <p className={styles.OtpModuleSubText}>
          Didn't get the code? Check your spam folder.
        </p>
      )}

      <div className={styles.OtpModuleButtons}>
        <Button
          tier="secondary"
          size="small"
          text="Start over"
          onClick={() => {
            router.push("/");
          }}
        />
        <Button
          onClick={resendOTP}
          tier="secondary"
          size="small"
          text="Resend the code"
        />
      </div>
    </div>
  );
};

export default OtpValidator;
