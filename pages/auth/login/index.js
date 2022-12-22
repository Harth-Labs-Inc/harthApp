import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import Cookies from "js-cookie";

import {
  login,
  sendOtpEmailToUser,
  loginAttempt,
} from "../../../requests/userApi";

import ErrorMessage from "../../../components/Common/Input/ErrorMessage";
import { Button, Input } from "../../../components/Common";
import { HarthLogoDark } from "../../../public/images/harth-logo-dark";

import styles from "./login.module.scss";

const Login = (props) => {
  const { changePage, inviteToken, currentPage } = props;
  const [errorMessage, setErrorMessage] = useState();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const router = useRouter();

  const submitHandler = async (data) => {
    let results = await loginAttempt(data);
    let { ok, user } = results;
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
  };

  return (
    <div className={styles.loginModule}>
      <HarthLogoDark />
      <div className={styles.greeting}>A place for friends to gather.</div>
      <form onSubmit={handleSubmit(submitHandler)}>
        <input
          {...register("email", { required: true })}
          placeholder="Enter your email"
        />
        <ErrorMessage
          errorMsg={errors.email ? "Enter your email to login." : errorMessage}
        />

        <Button
          className={styles.loginButton}
          type="submit"
          text="Sign In"
          tier="primary"
          fullWidth
        />
      </form>

      <div className={styles.formBottom}>
        <p className={styles.loginModuleDisclaimer}>
          By continuing, you are agreeing to our Customer{" "}
          <a
            href="https://static1.squarespace.com/static/6324af2b1cf55f7c7acccaa1/t/6345b4edc850907fdf964473/1665512685436/Terms%26Conditions.pdf"
            target="_blank"
            rel="noreferrer"
          >
            Terms of Service
          </a>{" "}
          and{" "}
          <a
            href="https://static1.squarespace.com/static/6324af2b1cf55f7c7acccaa1/t/6345b4a7a74906570621b492/1665512615431/HarthPrivacyPolicy.pdf"
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
          text="Need an account?"
          className={styles.loginModuleSignUpLink}
          onClick={() => {
            router.push("/auth/createAccount");
            // changePage("createaccount");
          }}
        />
      </div>
    </div>
  );
};
export default Login;
