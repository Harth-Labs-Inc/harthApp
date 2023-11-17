import { HarthLogoDark } from "public/images/harth-logo-dark";
import styles from "./welcome.module.scss";
import { Button, Modal } from "Common";
import { useRouter } from "next/router";

const Welcome = () => {
  const router = useRouter();
  return (
    <Modal blockBackground={true} onToggleModal={() => {}} ignoreFadeIn={true}>
      <div className={`${styles.welcomeModule} ${styles.fadeIn}`}>
        <div>
          <div className={styles.logoHolder}>
            <HarthLogoDark />
          </div>
          <div className={styles.greeting}>Where friends gather</div>
          <figure>
            <img src="/images/home_group.png" alt="Description of Image" />
          </figure>
        </div>
        <div className={styles.buttonWrapper}>
          <Button
            tier="primary"
            fullWidth
            text="Create an Account"
            className={styles.signUpLink}
            onClick={() => {
              router.push("/auth/createAccount");
            }}
          />
          <Button
            tier="primary"
            fullWidth
            text="Sign In"
            className={styles.signInLink}
            onClick={() => {
              router.push("/auth/login");
            }}
          />
        </div>
      </div>
    </Modal>
  );
};
export default Welcome;
