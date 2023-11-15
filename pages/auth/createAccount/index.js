import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import { checkForMatchingEmail } from "../../../requests/userApi";
import { Button, Modal } from "../../../components/Common";
import ErrorMessage from "../../../components/Common/Input/ErrorMessage";
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
  return (
    <Modal onToggleModal={() => {}} ignoreFadeIn={true}>
      <div className={`${styles.CreateModule} ${styles.fadeIn}`}>
        <div className={styles.CreateModuleContent}>
          <h3>Create an Account</h3>
          <form onSubmit={handleSubmit(submitHandler)}>
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
              <ErrorMessage
                errorMsg={errors.email ? handleEmailError() : null}
              />
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
              Enter your birthday for age verification. Your birthday will not
              be publicly displayed.
            </div>
            {errors.dob ? (
              <ErrorMessage errorMsg={errors.dob ? handleDobError() : null} />
            ) : null}
            {customErrors ? (
              <ErrorMessage
                errorMsg={customErrors ? customErrors.match : null}
              />
            ) : null}
            <div className={styles.buttonBar}>
              <Button
                tier="secondary"
                type="button"
                text="Back"
                className={styles.cancelButton}
                onClick={() => {
                  router.push("/auth/welcome");
                }}
                isDisabled={isSubmitting}
              />
              <Button
                tier="primary"
                type="submit"
                text="Next"
                className={styles.submitButton}
                fullWidth
                onClick={() => {
                  setSubmissionType("create");
                }}
                isLoading={isSubmitting}
                backgroundColor={"purple"}
              />
            </div>
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
        </div>
      </div>
    </Modal>
  );
};

export default CreateAccount;
