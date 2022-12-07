import React, { useState } from "react";
import { useForm } from "react-hook-form";
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
    // const [formData, setFormData] = useState({
    //     email: "",
    // });
    // const [errorData, setErrorData] = useState({
    //     email: false,
    //     access_code: false,
    // });

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    // const inputChangeHandler = (eData, data) => {
    //     setErrorData(eData);
    //     setFormData(data);
    // };

    // const setMissing = (missing) => {
    //     setErrorData(missing);
    // };

    const submitHandler = async (data) => {
        let results = await loginAttempt(data);
        let { ok, user } = results;
        if (ok) {
            await sendOtpEmailToUser(user);
            changePage("validateopt", user);
        } else {
            setErrorMessage("Invalid Email");
        }
    };

    return (
        <div className={styles.loginModule}>
            <HarthLogoDark />
            <div className={styles.greeting}>
                A place for friends to gather.
            </div>
            <form onSubmit={handleSubmit(submitHandler)}>
                <input
                    {...register("email", { required: true })}
                    placeholder="Enter your email"
                />
                <ErrorMessage
                    errorMsg={
                        errors.email
                            ? "Enter your email to login."
                            : errorMessage
                    }
                />

                <Button
                    className={styles.loginButton}
                    type="submit"
                    text="Sign In"
                    tier="primary"
                    fullWidth
                />
            </form>
            {/* <Form
                id="login"
                on_submit={submitHandler}
                on_missing={setMissing}
                data={formData}
                errorData={errorData}
            >
                <Input
                    name="email"
                    type="text"
                    empty={formData.email}
                    value={formData.email}
                    isrequired={true}
                    changeHandler={inputChangeHandler}
                    data={formData}
                    errorData={errorData}
                    changePage={changePage}
                    placeholder="Email"
                />
                <Button
                    type="submit"
                    text="Sign In"
                    tier="secondary"
                    fullWidth
                />
            </Form> */}
            <div className={styles.formBottom}>
                <p className={styles.loginModuleDisclaimer}>
                    By continuing, you are agreeing to our Customer{" "}
                    <a
                        href="https://static1.squarespace.com/static/6324af2b1cf55f7c7acccaa1/t/6345b4edc850907fdf964473/1665512685436/Terms%26Conditions.pdf"
                        target="_blank"
                    >
                        Terms of Service
                    </a>{" "}
                    and{" "}
                    <a
                        href="https://static1.squarespace.com/static/6324af2b1cf55f7c7acccaa1/t/6345b4a7a74906570621b492/1665512615431/HarthPrivacyPolicy.pdf"
                        target="_blank"
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
                        changePage("createaccount");
                    }}
                />
            </div>
        </div>
    );
};
export default Login;
