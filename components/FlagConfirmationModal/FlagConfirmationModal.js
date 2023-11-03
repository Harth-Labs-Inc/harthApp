import { Button, Modal } from "Common";
import styles from "./FlagConfirmationModal.module.scss";

/* eslint-disable */
const FlagConfirmationModal = ({ setHidden, flagSubmitHandler }) => {
  const submitHandler = async (e) => {
    e.preventDefault();
    flagSubmitHandler();
  };
  const handleCancel = () => {
    setHidden();
  };

  return (
    <Modal onToggleModal={handleCancel} classNames={styles.KickModal}>
      <div className={styles.mainContainer}>
        <div className={styles.title}>Flag post</div>
        <p>
          Flagging will send this post to the administrator of this härth for review. While the post is in review, other memebers will not be able to view the contents of the message. 
        </p>
        <p>
          Are you sure to want to flag this post?
        </p>
        <form onSubmit={submitHandler} className={styles.form}>
          <div className={styles.buttonBar}>
            <Button
              text="Cancel"
              tier="secondary"
              onClick={handleCancel}
              className={styles.cancelButton}
            />
            <Button type="submit" text="Flag" className={styles.submitButton} />
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default FlagConfirmationModal;
