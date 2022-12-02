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

            <h2>Create an account</h2>
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
                    customError={
                        customErrors["email"] || customErrors["match"]
                            ? customErrors["email"] || customErrors["match"]
                            : ""
                    }
                    data={formData}
                    errorData={errorData}
                />
                <Input
                    title="Full Name"
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
                    title="Date of Birth"
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
                            id="account-create-submit"
                            type="submit"
                            text="Continue"
                            onClick={() => {
                                setSubmissionType("create");
                            }}
                        ></Button>
                        <p className="disclaimer">
                            By creating an account, you agree to follow
                            H&auml;rth's <a>Guidelines</a>.
                        </p>
                        <div>
                            <a
                                id="return-login"
                                onClick={() => {
                                    changePage("login");
                                }}
                            >
                                Already have an account?
                            </a>
                        </div>
                    </div>
                </fieldset>
            </Form>
            <div></div>
        </div>
    );
};

export default CreateAccount;
