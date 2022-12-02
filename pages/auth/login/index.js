import React, { useState } from "react";
import Cookies from "js-cookie";

import {
    login,
    sendOtpEmailToUser,
    loginAttempt,
} from "../../../requests/userApi";

import Form from "../../../components/Form-comp";
import { Button, Input } from "../../../components/Common";
import { HarthLogoDark } from "../../../public/images/harth-logo-dark";

import styles from "./login.module.scss";

const Login = (props) => {
    const [errorMessage, setErrorMessage] = useState("");
    const [formData, setFormData] = useState({
        email: "",
    });
    const [errorData, setErrorData] = useState({
        email: false,
        access_code: false,
    });

    const { changePage, inviteToken, currentPage } = props;

    const inputChangeHandler = (eData, data) => {
        setErrorData(eData);
        setFormData(data);
    };

    const setMissing = (missing) => {
        setErrorData(missing);
    };

    const submitHandler = async () => {
        setErrorMessage("");
        let results = await loginAttempt(formData);
        let { ok, user } = results;
        if (ok) {
            await sendOtpEmailToUser(user);
            changePage("validateopt", user);
        }
    };

    return (
        <div className={styles.loginModule}>
            <HarthLogoDark />
            <Form
                id="login"
                on_submit={submitHandler}
                on_missing={setMissing}
                data={formData}
                errorData={errorData}
            >
                <Input
                    title="Email"
                    name="email"
                    type="text"
                    empty={formData.email}
                    value={formData.email}
                    isrequired={errorData["email"]}
                    changeHandler={inputChangeHandler}
                    data={formData}
                    errorData={errorData}
                    changePage={changePage}
                />

                <div className={styles.formBottom}>
                    <Button
                        id="login-submit"
                        type="submit"
                        text="Sign In"
                    ></Button>
                    <p className={styles.loginDisclaimer}>
                        By continuing, you are agreeing to our Customer Terms of
                        Service, Privacy Policy, and Cookie Policy.
                    </p>

                    <a
                        id="sign-up-link"
                        className={styles.signUpLink}
                        onClick={() => {
                            changePage("createaccount");
                        }}
                    >
                        Need an account?
                    </a>
                </div>
            </Form>
        </div>
    );
};
export default Login;
