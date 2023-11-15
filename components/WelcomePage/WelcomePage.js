import { Button } from "../Common";
import TalkingHead from "../TalkingHead/TalkingHead";
import styles from "./WelcomePage.module.scss";

const WelcomePage = ({ submitHandler, isSubmitting, signOutHandler }) => {
  const bubbleText = "Welcome to Harth! Let me help you get something setup";

  return (
    <div className={`${styles.CreateModule} ${styles.fadeIn}`}>
      <div className={styles.CreateModuleContent}>
        <div className={styles.CreateModuleLogo}></div>
        <TalkingHead text={bubbleText} />
        <h4>You're in!</h4>
        <p className={`${styles.label} ${styles.largerFont}`}>
          You have created your harth account. Now it's time for you to join
          your friends.
        </p>

        <Button
          tier="primary"
          type="submit"
          text="Let's go"
          className={styles.signupButton}
          fullWidth
          isLoading={isSubmitting}
          isDisabled={false}
          backgroundColor={"purple"}
          onClick={submitHandler}
        />
        <Button
          tier="secondary"
          type="button"
          text="Sign out"
          className={styles.signupButton}
          onClick={signOutHandler}
        />
      </div>
    </div>
  );
};

export default WelcomePage;
