import { useForm } from "react-hook-form";
import { HarthLogoDark } from "public/images/harth-logo-dark";
import { Button } from "../Common";
import TalkingHead from "../TalkingHead/TalkingHead";

import styles from "./TermsOfServiceModal.module.scss";
import CheckIcon from "resources/icons/check";

const TermsOfServiceModal = ({
  buttonText,
  submitHandler,
  isSubmitting,
  includeWelcome,
  inAppStyle,
}) => {
  const { register, handleSubmit, watch, setValue } = useForm();

  const termsOfServiceChecked = watch("termsOfServiceApproved");

  const bubbleText = "Help us create a better place";

  const toggleCheckbox = () => {
    setValue("termsOfServiceApproved", !termsOfServiceChecked);
  };

  return (
    <div className={`${styles.CreateModule} ${styles.fadeIn}`}>
      <div className={styles.CreateModuleContent}>
        <div className={styles.CreateModuleLogo}>
          {includeWelcome ? <h2>Welcome to</h2> : null}
          <HarthLogoDark />
        </div>
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

          <Button
            tier="primary"
            type="submit"
            text={buttonText}
            className={styles.signupButton}
            fullWidth
            isLoading={isSubmitting}
            isDisabled={!termsOfServiceChecked}
            backgroundColor={termsOfServiceChecked ? "purple" : false}
          />
        </form>
      </div>
    </div>
  );
};

export default TermsOfServiceModal;
