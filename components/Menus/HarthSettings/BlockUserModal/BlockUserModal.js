import { Button } from "Common";
import { blockUser } from "../../../../requests/userApi";
import styles from "./BlockUserModal.module.scss";
import { useSocket } from "contexts/socket";
import { useComms } from "contexts/comms";
/* eslint-disable */
const BlockUserModal = ({ setHidden, usr, activeUser, closeHandler }) => {
  const { emitUpdate } = useSocket();
  const { selectedcomm } = useComms();

  const submitHandler = async (e) => {
    e.preventDefault();

    const { data } = await blockUser({
      ActiveUser: activeUser,
      userIdToBlock: usr?.userId,
    });
    if (data.newUser) {
      let msg = {};
      msg.updateType = "selected user full user reload";
      msg.userID = activeUser._id;
      msg.newUser = data.newUser;
      emitUpdate(selectedcomm._id, msg, async (err) => {
        if (err) {
          console.error(err);
        }
      });
    }
    setHidden();
    if (closeHandler) {
      closeHandler();
    }
  };
  const handleCancel = () => {
    setHidden();
  };

  return (
    <div className={styles.mainContainer}>
      <div className={styles.title}>!Confirm Removal!</div>
      <p>
        Are you sure you want to BLOCK {usr?.name}. Blocking disables the
        ability of a user to send Direct Message to you and send Invites to new
        h&auml;rths.
      </p>
      <img className={styles.userImage} src={usr?.iconKey} loading="lazy" />
      <p className={styles.userName}>{usr?.name}</p>

      <form onSubmit={submitHandler} className={styles.form}>
        <div className={styles.buttonBar}>
          <Button
            text="Cancel"
            onClick={handleCancel}
            className={styles.cancelButton}
          />
          <Button type="submit" text="Block" className={styles.submitButton} />
          <Button
            type="submit"
            text="Block & Report"
            className={styles.submitButton}
          />
        </div>
      </form>
    </div>
  );
};

export default BlockUserModal;
