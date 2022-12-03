import { useState } from "react";
import Cookies from "js-cookie";

import { login, addUser, sendOtpEmailToUser } from "../../../requests/userApi";
import { Button, Input } from "../../../components/Common";
import Form from "../../../components/Form-comp";
import TalkingHead from "../../../components/TalkingHead/TalkingHead";

import styles from "./createAccount.module.scss";

const CreateAccount = (props) => {
    const [submissionType, setSubmissionType] = useState();
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        dob: "",
    });
    const [errorData, setErrorData] = useState({
        fullName: "",
        email: false,
        dob: false,
    });
    const [customErrors, setCustomErrors] = useState({
        email: "",
        match: "",
    });

    const { changePage, inviteToken } = props;

    const submitHandler = async () => {
        if (submissionType == "create") {
            const data = await addUser(formData);
            console.log(data, "data");
            const { ok, errors, user } = data;
            console.log(user);
            if (!ok) {
                setCustomErrors(errors);
            } else {
                sendOTPEmail(user);
            }
        }
    };

    const inputChangeHandler = (eData, data) => {
        setErrorData(eData);
        setFormData(data);
    };

    const setMissing = (missing) => {
        setErrorData(missing);
    };

    const sendOTPEmail = async (user) => {
        await sendOtpEmailToUser(user);
        user.showFirstTimeUser = true;
        changePage("validateopt", user);
    };

    const bubbleText =
        "Welcome to the härth beta. Enter your details below and I will create your account.";

    return (
        <div className={styles.CreateModule}>
            <TalkingHead text={bubbleText} />
            <Form
                id="login"
                on_submit={submitHandler}
                on_missing={setMissing}
                data={formData}
                errorData={errorData}
            >
                <Input
                    placeholder="Email"
                    name="email"
                    type="text"
                    empty={formData.email}
                    value={formData.email}
                    isrequired={errorData["email"]}
                    changeHandler={inputChangeHandler}
                    customError={
                        customErrors["email"] || customErrors["match"]
                            ? customErrors["email"] || customErrors["match"]
                            : ""
                    }
                    data={formData}
                    errorData={errorData}
                />
                <Input
                    placeholder="Full Name"
                    name="fullName"
                    type="text"
                    empty={formData.fullName}
                    value={formData.fullName}
                    isrequired={errorData["fullName"] ? true : false}
                    changeHandler={inputChangeHandler}
                    data={formData}
                    errorData={errorData}
                />
                <Input
                    placeholder="Date of Birth"
                    name="dob"
                    type="date"
                    empty={true}
                    value={formData.dob}
                    isrequired={errorData["dob"]}
                    changeHandler={inputChangeHandler}
                    data={formData}
                    errorData={errorData}
                />
                <fieldset
                    className={customErrors["match"] ? "error" : undefined}
                >
                    <div className="form-bottom">
                        <Button
                            tier="secondary"
                            type="submit"
                            text="Sign Up"
                            fullWidth
                            onClick={() => {
                                setSubmissionType("create");
                            }}
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
                        <div>
                            <Button
                                size="small"
                                text="Already have an account?"
                                onClick={() => {
                                    changePage("login");
                                }}
                            />
                        </div>
                    </div>
                </fieldset>
            </Form>
            <div></div>
        </div>
    );
};

export default CreateAccount;
