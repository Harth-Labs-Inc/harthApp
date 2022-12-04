import { useState } from "react";
import { useForm } from "react-hook-form";
import Cookies from "js-cookie";

import { login, addUser, sendOtpEmailToUser } from "../../../requests/userApi";
import { Button } from "../../../components/Common";
import ErrorMessage from "../../../components/Common/Input/ErrorMessage";
// import Form from "../../../components/Form-comp";
import TalkingHead from "../../../components/TalkingHead/TalkingHead";

import styles from "./createAccount.module.scss";

const CreateAccount = (props) => {
    const [submissionType, setSubmissionType] = useState();
    // const [formData, setFormData] = useState({
    //     fullName: "",
    //     email: "",
    //     dob: "",
    // });
    // const [errorData, setErrorData] = useState({
    //     fullName: "",
    //     email: false,
    //     dob: false,
    // });
    const [customErrors, setCustomErrors] = useState({
        email: "",
        match: "",
    });
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const { changePage, inviteToken } = props;

    const submitHandler = async (data) => {
        console.log(data);
        if (submissionType == "create") {
            const response = await addUser(data);
            const { ok, errors, user } = response;

            if (!ok) {
                setCustomErrors(errors);
            } else {
                sendOTPEmail(user);
            }
        }
    };

    // const inputChangeHandler = (eData, data) => {
    //     setErrorData(eData);
    //     setFormData(data);
    // };

    // const setMissing = (missing) => {
    //     setErrorData(missing);
    // };

    const sendOTPEmail = async (user) => {
        await sendOtpEmailToUser(user);
        user.showFirstTimeUser = true;
        changePage("validateopt", user);
    };

    const handleEmailError = () => {
        if (errors?.email?.type === "required")
            return "You must enter your email.";
        if (errors?.email?.type === "pattern")
            return "You must enter a valid email.";
    };

    const bubbleText =
        "Welcome to the härth beta. Enter your details below and I will create your account.";

    return (
        <div className={styles.CreateModule}>
            <div className={styles.CreateModuleContent}>
                <TalkingHead text={bubbleText} />
                <form onSubmit={handleSubmit(submitHandler)}>
                    <input
                        {...register("fullName", { required: true })}
                        type="text"
                        placeholder="Name"
                    />
                    <ErrorMessage
                        errorMsg={
                            errors.fullName ? "You must enter your name." : null
                        }
                    />
                    <input
                        {...register("email", {
                            required: true,
                            pattern: /.*\@.*\.\w{2,3}/g,
                        })}
                        type="email"
                        placeholder="Email"
                    />
                    <ErrorMessage
                        errorMsg={errors.email ? handleEmailError() : null}
                    />

                    <input
                        {...register("dob", { required: true })}
                        type="date"
                    />
                    <ErrorMessage
                        errorMsg={
                            errors.dob
                                ? "You must enter your birthdate to enter."
                                : null
                        }
                    />
                    <p>Your birday will not be publically displayed.</p>
                    <ErrorMessage
                        errorMsg={customErrors ? customErrors.match : null}
                    />
                    <Button
                        tier="secondary"
                        type="submit"
                        text="Sign Up"
                        fullWidth
                        onClick={() => {
                            setSubmissionType("create");
                        }}
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

                    <Button
                        tier="secondary"
                        type="submit"
                        text="Sign Up"
                        fullWidth
                        onClick={() => {
                            setSubmissionType("create");
                        }}
                    />
                </Form> */}
                <p className={styles.CreateModuleDisclaimer}>
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
                    text="Already have an account?"
                    onClick={() => {
                        changePage("login");
                    }}
                    className={styles.CreateModuleLinkToSignin}
                />
            </div>
        </div>
    );
};

export default CreateAccount;
