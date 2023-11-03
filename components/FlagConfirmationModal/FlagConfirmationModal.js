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
          Are you sure you want to Flag this? Flagging disables the ability to
          view a post until approval.
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
