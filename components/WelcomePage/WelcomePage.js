import { Button } from "../Common";
import TalkingHead from "../TalkingHead/TalkingHead";
import styles from "./WelcomePage.module.scss";
/* eslint-disable */
const WelcomePage = ({ submitHandler, isSubmitting, signOutHandler }) => {
  const bubbleText = "Welcome to Härth!";

  return (
    <div className={`${styles.CreateModule} ${styles.fadeIn}`}>
      <div className={styles.CreateModuleContent}>
        <div className={styles.CreateModuleLogo}></div>
        <TalkingHead text={bubbleText} />
        <h4>Success!</h4>
        <p className={`${styles.label} ${styles.largerFont}`}>
          You have created a Härth account. <br />Now it's time to join
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
          onClick={submitHandler}
        />
        <Button
          tier="secondary"
          type="button"
          text="Sign out"
          className={styles.second}
          onClick={signOutHandler}
        />
      </div>
    </div>
  );
};

export default WelcomePage;
