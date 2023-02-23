import React from "react";

import { Button } from "../../../Common";

import styles from "./KickUserModal.module.scss";

const KickUserModal = ({ setHidden, submitKickHandler, usr }) => {
  const submitHandler = async (e) => {
    e.preventDefault();
    submitKickHandler(usr);
    setHidden();
  };
  const handleCancel = () => {
    setHidden();
  };

  //console.log(harth);

  return (
    <div className={styles.mainContainer}>
      <div className={styles.title}>!Confirm Removal!</div>
      <p>The following member is about to be removed from this h&auml;rth</p>
      <img className={styles.userImage} src={usr?.iconKey} loading="lazy" />
      <p className={styles.userName}>{usr?.name}</p>
      <p className={styles.text}>They must be invited back to rejoin</p>

      <form onSubmit={submitHandler} className={styles.form}>
        <div className={styles.buttonBar}>
          <Button
            text="Cancel"
            tier="secondary"
            onClick={handleCancel}
            className={styles.cancelButton}
          />
          <Button type="submit" text="Remove" className={styles.submitButton} />
        </div>
      </form>
    </div>
  );
};

export default KickUserModal;
