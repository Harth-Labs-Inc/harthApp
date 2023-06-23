import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import { HarthLogoDark } from "../../../public/images/harth-logo-dark";
import {
  verifyOtp,
  login,
  sendOtpEmailToUser,
  loginAttempt,
} from "../../../requests/userApi";
import TalkingHead from "../../../components/TalkingHead/TalkingHead";
import CodeInput from "../../../components/CodeInput/CodeInput";
import { Button } from "../../../components/Common";

import styles from "./otpValidator.module.scss";

const OtpValidator = (props) => {
  const {
    userForModal,
    alternativeEmail,
    isInModal,
    closeModal,
    parentSubmit,
  } = props;
  const [newUser, setNewUser] = useState();
  const [hasResent, setHasResent] = useState(false);
  /* eslint-disable-next-line */
  const [isResending, setIsResending] = useState(false);
  const [badCode, setBadCode] = useState(false);

  const router = useRouter();
  const { user } = router.query;

  useEffect(() => {
    if (user) {
      setNewUser(JSON.parse(user));
    }
    if (userForModal) {
      setNewUser(userForModal);
    }
  }, [user, userForModal]);

  const [inviteCode, setInviteCode] = useState();
  const [helpText, setHelpText] = useState([
    "Go ahead and punch in the secret code I just sent you.",
  ]);
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
      if (isInModal) {
        parentSubmit();
      } else {
        const data = await login(newUser);
        const { ok, tkn } = data;
        if (ok) {
          setBadCode(false);
          setHelpText(["SUCCESS!!"]);
          localStorage.setItem("token", tkn);
          Cookies.set("authToken", tkn, { expires: 365 });
          if (newUser.showFirstTimeUser) {
            localStorage.setItem("showFirstTimeUser", true);
          }
          router.push("/");
        }
      }
    } else {
      setBadCode(true);
      setInviteCode("");
      setHelpText(["Whoa, hold up.", "That code you punched in was wrong."]);
    }
  };
  const resendOTP = async () => {
    let results = await loginAttempt(newUser);
    let { ok, user } = results;
    if (ok) {
      setIsResending(true);
      await sendOtpEmailToUser({
        user: { ...user, ["email"]: alternativeEmail || user["email"] },
        subject: "Email Verification",
      });
      setHasResent(true);
      setIsResending(false);
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
      <TalkingHead textArray={helpText} />
      <p className={styles.OtpModuleText}>
        Enter the security code we just sent to{" "}
        {alternativeEmail || newUser?.email}
      </p>
      <CodeInput onChange={inputChangeHandler} codeInput={inviteCode} />
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
          {badCode ? (
            <span style={{ color: "red" }}>Invalid code</span>
          ) : (
            "Didn't get the code? Check your spam folder."
          )}
        </p>
      )}

      <div className={styles.OtpModuleButtons}>
        <Button
          tier="secondary"
          size="small"
          text={isInModal ? "close" : "Start over"}
          onClick={() => {
            if (isInModal) {
              closeModal();
            } else {
              router.push("/");
            }
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
