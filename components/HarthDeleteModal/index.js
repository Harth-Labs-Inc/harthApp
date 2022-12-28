import React from "react";

import { Button } from "../Common";

import styles from "./HarthDeleteModal.module.scss";

const HarthDeleteModal = ({ setHidden, submitHarthChange, harth }) => {
  const submitHandler = async (e) => {
    e.preventDefault();
    submitHarthChange(harth);
  };
  const handleCancel = () => {
    setHidden();
  };

  return (
    <div className={styles.mainContainer}>
      <div className={styles.title}>Confirm Delete</div>
      <p>you are about to delete</p>
      <p>{harth?.name}</p>
      <p>
        the harth will be deleted and all content will be deleted. This cannot
        be undone
      </p>
      <form onSubmit={submitHandler} className={styles.form}>
        <div className={styles.buttonBar}>
          <Button
            text="Cancel"
            tier="secondary"
            onClick={handleCancel}
            className={styles.cancelButton}
          />
          <Button type="submit" text="DELETE" className={styles.submitButton} />
        </div>
      </form>
    </div>
  );
};

export default HarthDeleteModal;
