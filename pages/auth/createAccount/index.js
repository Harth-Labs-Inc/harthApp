import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import { HarthLogoDark } from "public/images/harth-logo-dark";
import { checkForMatchingEmail } from "../../../requests/userApi";
import { Button } from "../../../components/Common";
import ErrorMessage from "../../../components/Common/Input/ErrorMessage";
import TalkingHead from "../../../components/TalkingHead/TalkingHead";
import styles from "./createAccount.module.scss";
import { useAuth } from "contexts/auth";

const CreateAccount = () => {
  const router = useRouter();

  const { setNewUser } = useAuth();

  const [submissionType, setSubmissionType] = useState();
  const [customErrors, setCustomErrors] = useState({
    email: "",
    match: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [todayMax, setTodayMax] = useState();

  useEffect(() => {
    setTodayMax(new Date().toISOString().split("T")[0]);
  }, []);

  function calculateAge(birthdate) {
    const today = new Date();
    const birthDate = new Date(birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const submitHandler = async (data) => {
    setCustomErrors({
      email: "",
      match: "",
    });
    setIsSubmitting(true);
    if (submissionType == "create") {
      const response = await checkForMatchingEmail(data);
      const { ok, errors } = response;

      if (!ok) {
        setCustomErrors(errors);
      } else {
        const newUser = {
          ...data,
          comms: [],
          rooms: [],
          showFirstTimeUser: true,
        };
        setNewUser(newUser);
        router.push("/auth/TOS");
      }
    }
    setIsSubmitting(false);
  };
  const handleEmailError = () => {
    if (errors?.email?.type === "required") return "You must enter your email";
    if (errors?.email?.type === "pattern")
      return "You must enter a valid email";
  };
  const handleDobError = () => {
    if (errors?.dob?.type === "required")
      return "You must enter a valid birthdate";
    if (errors?.dob?.type === "olderThanThirteen")
      return "You must be at least 13 years old to register";
  };

  const bubbleText =
    "Welcome to the early release of Härth. Enter your details below to create an account.";

  return (
    <div className={`${styles.CreateModule} ${styles.fadeIn}`}>
      <div className={styles.CreateModuleContent}>
        <div className={styles.CreateModuleLogo}>
          <HarthLogoDark />
        </div>
        <TalkingHead text={bubbleText} />
        <form onSubmit={handleSubmit(submitHandler)}>
          <p className={styles.label}>Full Name</p>
          <input
            {...register("fullName", { required: true })}
            type="text"
            placeholder="Name"
          />
          {errors.fullName ? (
            <ErrorMessage
              errorMsg={errors.fullName ? "You must enter your name" : null}
            />
          ) : null}

          <p className={styles.label}>Email</p>
          <input
            {...register("email", {
              required: true,
              /* eslint-disable-next-line */
              pattern: /.*\@.*\.\w{2,3}/g,
            })}
            type="email"
            placeholder="Email"
          />
          {errors.email ? (
            <ErrorMessage errorMsg={errors.email ? handleEmailError() : null} />
          ) : null}

          <p className={styles.label}>Date of Birth</p>
          <input
            {...register("dob", {
              required: true,
              validate: {
                olderThanThirteen: (v) => calculateAge(v) > 12,
              },
            })}
            type="date"
            max={todayMax}
            min={new Date("1/1/1910").toISOString().split("T")[0]}
          />
          <div className={styles.small}>
            Enter your birthday for age verification. Your birthday will not be
            publicly displayed.
          </div>
          {errors.dob ? (
            <ErrorMessage errorMsg={errors.dob ? handleDobError() : null} />
          ) : null}
          {customErrors ? (
            <ErrorMessage errorMsg={customErrors ? customErrors.match : null} />
          ) : null}

          <Button
            tier="primary"
            type="submit"
            text="Continue"
            className={styles.signupButton}
            fullWidth
            onClick={() => {
              setSubmissionType("create");
            }}
            isLoading={isSubmitting}
          />
        </form>
        <p className={styles.CreateModuleDisclaimer}>
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
          tier="secondary"
          size="small"
          text="Already have an account?"
          onClick={() => {
            router.push("/auth/login");
          }}
          className={styles.CreateModuleLinkToSignin}
        />
      </div>
    </div>
  );
};

export default CreateAccount;
