import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../../contexts/auth";
import {
  verifyOtp,
  login,
  sendOtpEmailToUser,
  loginAttempt,
} from "../../../requests/userApi";
import CodeInput from "../../../components/CodeInput/CodeInput";
import { Button, Modal } from "../../../components/Common";

import styles from "./otpValidator.module.scss";

const OtpValidator = (props) => {
  const {
    userForModal,
    alternativeEmail,
    isInModal,
    closeModal,
    parentSubmit,
  } = props;
  const router = useRouter();
  const { getInitialData, newUser: tempUser } = useAuth();

  const [newUser, setNewUser] = useState();
  const [hasResent, setHasResent] = useState(false);
  /* eslint-disable-next-line */
  const [isResending, setIsResending] = useState(false);
  const [badCode, setBadCode] = useState(false);
  const [inviteCode, setInviteCode] = useState();
  /* eslint-disable-next-line */
  const [helpText, setHelpText] = useState([
    "Enter the secret code I just sent you.",
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (tempUser) {
      setNewUser(tempUser);
    }
    if (userForModal) {
      setNewUser(userForModal);
    }
  }, [tempUser, userForModal]);

  useEffect(() => {
    if (inviteCode?.length === 6) {
      handlerSubmit();
    }
  }, [inviteCode]);

  const inputChangeHandler = (text) => {
    setInviteCode(text);
  };
  const handlerSubmit = async () => {
    if (!isSubmitting) {
      setIsSubmitting(true);
      let result = await verifyOtp({ inviteCode, newUser });
      let { ok } = result;
      if (ok) {
        if (isInModal) {
          parentSubmit();
          setIsSubmitting(false);
        } else {
          const data = await login(newUser);
          const { ok, tkn } = data;
          if (ok) {
            setBadCode(false);
            setHelpText(["SUCCESS!!"]);
            setIsSubmitting(false);

            localStorage.setItem("token", tkn);
            if (newUser.showFirstTimeUser) {
              localStorage.setItem("showFirstTimeUser", true);
            }
            getInitialData(tkn);
          }
        }
      } else {
        setIsSubmitting(false);
        setBadCode(true);
        setInviteCode("");
        setHelpText(["Whoa, hold up.", "That code you entered was wrong."]);
      }
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
    return null;
  }

  return (
    <Modal onToggleModal={() => {}} ignoreFadeIn={true}>
      <div className={`${styles.OtpModule} ${styles.fadeIn}`}>
        <h3>Security Check</h3>
        <figure>
          <img src="/images/emailLogo (1).svg" />
        </figure>
        <h4>Check your email</h4>
        <p className={styles.OtpModuleText}>
          Enter the security code we just sent to{" "}
          {alternativeEmail || newUser?.email}
        </p>
        <div className={styles.codeWrapper}>
          {isSubmitting ? <div className={styles.isSubmitting}></div> : null}
          <CodeInput onChange={inputChangeHandler} codeInput={inviteCode} />
        </div>

        {hasResent ? (
          <>
            <p className={styles.OtpModuleSubText}>
              Your code has been resent.
            </p>
            <p className={styles.OtpModuleSubText}>
              Please wait up to 15 minutes for your code to arrive and remember
              to check your spam folder.
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
                router.push("/auth/welcome");
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
    </Modal>
  );
};

export default OtpValidator;
