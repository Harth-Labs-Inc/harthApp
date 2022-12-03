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
        if (formData.email) {
            console.log(formData.email);
        } else {
            console.log("error");
        }
        // let results = await loginAttempt(formData);
        // let { ok, user } = results;
        // if (ok) {
        //     await sendOtpEmailToUser(user);
        //     changePage("validateopt", user);
        // }
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

                <div className={styles.formBottom}>
                    <Button
                        type="submit"
                        text="Sign In"
                        tier="secondary"
                        fullWidth
                    />
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
                        text="Need an account?"
                        className={styles.loginModuleSignUpLink}
                        onClick={() => {
                            changePage("createaccount");
                        }}
                    />
                </div>
            </Form>
        </div>
    );
};
export default Login;
