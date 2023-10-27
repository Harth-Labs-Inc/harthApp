import { Button } from "Common";
import { UnblockUser } from "../../../../requests/userApi";
import styles from "./UnBlockUserModal.module.scss";
import { useSocket } from "contexts/socket";
import { useComms } from "contexts/comms";
/* eslint-disable */
const UnBlockUserModal = ({ setHidden, usr, activeUser }) => {
  const { emitUpdate } = useSocket();
  const { selectedcomm } = useComms();

  const submitHandler = async (e) => {
    e.preventDefault();

    const { data } = await UnblockUser({
      ActiveUser: activeUser,
      userIdToUnblock: usr?.userId,
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
  };
  const handleCancel = () => {
    setHidden();
  };

  return (
    <div className={styles.mainContainer}>
      <div className={styles.title}>!Confirm UnBlock!</div>
      <p>
        "Are you sure you want to UNBLOCK {usr?.name}. UnBlocking will allow the
        user to send Direct Messages to you and send Invites to new h&auml;rths.
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
          <Button
            type="submit"
            text="UnBlock"
            className={styles.submitButton}
          />
        </div>
      </form>
    </div>
  );
};

export default UnBlockUserModal;
