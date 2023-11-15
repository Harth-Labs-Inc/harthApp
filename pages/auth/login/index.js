import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";

import { sendOtpEmailToUser, loginAttempt } from "../../../requests/userApi";

import ErrorMessage from "../../../components/Common/Input/ErrorMessage";
import { Button, Modal } from "Common";

import styles from "./login.module.scss";
import { useAuth } from "contexts/auth";

const Login = () => {
  const [errorMessage, setErrorMessage] = useState();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const router = useRouter();
  const { setNewUser } = useAuth();

  const submitHandler = async (data) => {
    setIsSubmitting(true);
    const results = await loginAttempt(data);
    const { ok, user } = results;
    if (ok) {
      await sendOtpEmailToUser({ user, subject: "Login Verification" });
      setNewUser(user);
      router.push("/auth/OtpValidator");
    } else {
      setErrorMessage("Invalid Email");
    }
    setIsSubmitting(false);
  };

  return (
    <Modal onToggleModal={() => {}} ignoreFadeIn={true}>
      <div className={`${styles.loginModule} ${styles.fadeIn}`}>
        <h3>Sign In</h3>
        <form onSubmit={handleSubmit(submitHandler)}>
          <p className={styles.label}>Login</p>
          <input
            {...register("email", { required: true })}
            placeholder="Enter your email"
            autoCapitalize="none"
          />
          <ErrorMessage
            errorMsg={
              errors.email ? "Enter a valid email to login." : errorMessage
            }
          />
          <div className={styles.buttonBar}>
            <Button
              tier="secondary"
              type="button"
              text="Back"
              className={styles.cancelButton}
              onClick={() => {
                router.push("/auth/welcome");
              }}
              isDisabled={isSubmitting}
            />
            <Button
              className={styles.submitButton}
              type="submit"
              text="Sign In"
              tier="primary"
              fullWidth
              isLoading={isSubmitting}
              backgroundColor={"purple"}
            />
          </div>
        </form>

        <div className={styles.formBottom}>
          <p className={styles.loginModuleDisclaimer}>
            By continuing, you are agreeing to our Customer&nbsp;
            <a
              href="https://harthsocial.com/terms"
              target="_blank"
              rel="noreferrer"
            >
              Terms of Service
            </a>
            &nbsp;and&nbsp;
            <a
              href="https://harthsocial.com/privacy"
              target="_blank"
              rel="noreferrer"
            >
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </Modal>
  );
};
export default Login;
