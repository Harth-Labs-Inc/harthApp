import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";

import { HarthLogoDark } from "../../../public/images/harth-logo-dark";
import { login, addUser, sendOtpEmailToUser } from "../../../requests/userApi";
import { Button } from "../../../components/Common";
import ErrorMessage from "../../../components/Common/Input/ErrorMessage";
import TalkingHead from "../../../components/TalkingHead/TalkingHead";

import styles from "./createAccount.module.scss";

const CreateAccount = (props) => {
    const { changePage, inviteToken } = props;
    const router = useRouter();

    const [submissionType, setSubmissionType] = useState();
    const [customErrors, setCustomErrors] = useState({
        email: "",
        match: "",
    });

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const submitHandler = async (data) => {
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

    const sendOTPEmail = async (user) => {
        await sendOtpEmailToUser({ user, subject: "Email Verification" });
        user.showFirstTimeUser = true;
        router.push(
            {
                pathname: "/auth/OtpValidator",
                query: { user: JSON.stringify(user) },
            },
            "/about/OtpValidator"
        );
    };

    const handleEmailError = () => {
        if (errors?.email?.type === "required")
            return "You must enter your email";
        if (errors?.email?.type === "pattern")
            return "You must enter a valid email";
    };

    const bubbleText =
        "Welcome to the early release of Härth. Enter your details below to create an account.";

    return (
        <div className={styles.CreateModule}>
            <div className={styles.CreateModuleContent}>
                <div className={styles.CreateModuleLogo}>
                    <HarthLogoDark />
                </div>
                <TalkingHead text={bubbleText} />
                <form onSubmit={handleSubmit(submitHandler)}>
                    <input
                        {...register("fullName", { required: true })}
                        type="text"
                        placeholder="Name"
                    />
                    <ErrorMessage
                        errorMsg={
                            errors.fullName ? "You must enter your name" : null
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
                        //placeholder="Your Birthday"
                    />
                    <div className={styles.small}>
                        Enter your birthday for verification. Your birthday will not be publicly displayed.
                    </div>

                    <ErrorMessage
                        errorMsg={
                            errors.dob
                                ? "You must enter a valid birthdate"
                                : null
                        }
                    />
                    <ErrorMessage
                        errorMsg={customErrors ? customErrors.match : null}
                    />
                    <Button
                        tier="primary"
                        type="submit"
                        text="Sign Up"
                        fullWidth
                        onClick={() => {
                            setSubmissionType("create");
                        }}
                    />
                </form>
                <p className={styles.CreateModuleDisclaimer}>
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
                    tier="secondary"
                    size="small"
                    text="Already have an account?"
                    onClick={() => {
                        router.push("/");
                    }}
                    className={styles.CreateModuleLinkToSignin}
                />
            </div>
        </div>
    );
};

export default CreateAccount;
