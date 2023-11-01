import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";

import { sendOtpEmailToUser, loginAttempt } from "../../../requests/userApi";

import ErrorMessage from "../../../components/Common/Input/ErrorMessage";
import { Button } from "Common";
import { HarthLogoDark } from "public/images/harth-logo-dark";

import styles from "./login.module.scss";

const Login = () => {
  const [errorMessage, setErrorMessage] = useState();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const router = useRouter();

  const submitHandler = async (data) => {
    setIsSubmitting(true);
    const results = await loginAttempt(data);
    const { ok, user } = results;
    if (ok) {
      await sendOtpEmailToUser({ user, subject: "Login Verification" });
      router.push(
        {
          pathname: "/auth/OtpValidator",
          query: { user: JSON.stringify(user) },
        },
        "/about/OtpValidator"
      );
    } else {
      setErrorMessage("Invalid Email");
    }
    setIsSubmitting(false);
  };

  return (
    <div className={`${styles.loginModule} ${styles.fadeIn}`}>
      <div className={styles.logoHolder}>
        <HarthLogoDark />
      </div>

      <div className={styles.greeting}>make a better place</div>
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
        {/* {errorMessage === "Invalid Email" ? (
          // <div className={styles.accountCreateAlert}>Do you need to create an account?
          //     <button
          //         onClick={() => {
          //         router.push("/auth/createAccount");
          //         // changePage("createaccount");
          //         }}>
          //         Click Here
          //     </button>
          // </div>
          <div className={styles.accountCreateAlert}>
            We are currently in an early release.
            <br />
            Click below to get on the list.
            <br />
            <br />
            <a href="https://www.harthsocial.com/">www.harthsocial.com</a>
          </div>
        ) : null} */}
        <Button
          className={styles.loginButton}
          type="submit"
          text="Sign In"
          tier="primary"
          fullWidth
          isLoading={isSubmitting}
        />
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
        <Button
          size="small"
          tier="secondary"
          text="Create an Account"
          className={styles.loginModuleSignUpLink}
          onClick={() => {
            router.push("/auth/createAccount");
          }}
        />
      </div>
    </div>
  );
};
export default Login;
