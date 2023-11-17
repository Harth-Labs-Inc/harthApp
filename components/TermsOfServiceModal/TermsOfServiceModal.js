import { useForm } from "react-hook-form";
import { Button } from "../Common";
import TalkingHead from "../TalkingHead/TalkingHead";
import { IconChevronLeft } from "resources/icons/IconChevronLeft";
import styles from "./TermsOfServiceModal.module.scss";
import CheckIcon from "resources/icons/check";
import { useRouter } from "next/router";

const TermsOfServiceModal = ({ buttonText, submitHandler, isSubmitting }) => {
  const { register, handleSubmit, watch, setValue } = useForm();

  const router = useRouter();

  const termsOfServiceChecked = watch("termsOfServiceApproved");

  const bubbleText =
    "Help us create a better space by treating others with respect.";

  const toggleCheckbox = () => {
    setValue("termsOfServiceApproved", !termsOfServiceChecked);
  };

  return (
    <div className={`${styles.CreateModule} ${styles.fadeIn}`}>
      <div className={styles.CreateModuleContent}>
        <div className={styles.header}>User Agreement</div>
        <TalkingHead text={bubbleText} />
        <p className={styles.label}>
          By continuing to use Harth, you agree to treat others with respect by
          not posting objectionable content or sending harassing messages.
        </p>
        <form onSubmit={handleSubmit(submitHandler)}>
          <label>
            <input
              {...register("termsOfServiceApproved", { required: true })}
              type="checkbox"
            />
            <div className={styles.checkboxContainer}>
              <button
                className={styles.customCheckboxIcon}
                type="button"
                onClick={toggleCheckbox}
              ></button>
              {termsOfServiceChecked ? (
                <div className={styles.checkmark}>
                  <CheckIcon />
                </div>
              ) : null}
            </div>
            <span>
              I have read and agree to the{" "}
              <a
                href="https://harthsocial.com/terms"
                target="_blank"
                rel="noreferrer"
              >
                Terms of Service
              </a>
            </span>
          </label>
          <div className={styles.buttonBar}>
            <button
              type="button"
              className={styles.backButton}
              onClick={() => {
                router.push("/auth/createAccount");
              }}
            >
              <IconChevronLeft />
            </button>
            <Button
              tier="primary"
              type="submit"
              text={buttonText}
              className={styles.submitButton}
              fullWidth
              isLoading={isSubmitting}
              isDisabled={!termsOfServiceChecked}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default TermsOfServiceModal;
