import React, { useEffect, useState } from "react";
import { Button } from "../Common";

import styles from "./HarthEditModal.module.scss";

const HarthEditModal = ({ setHidden, harth, submitHarthChangeHandler }) => {
  const [updatedHarth, setUpdatedHarth] = useState({ name: "" });

  useEffect(() => {
    if (harth) {
      setUpdatedHarth(harth);
    }
  }, [harth]);

  const nameChangeHandler = (e) => {
    const { value } = e.target;
    setUpdatedHarth({ ...updatedHarth, ["name"]: value });
  };
  const submitHandler = async (e) => {
    e.preventDefault();
    submitHarthChangeHandler(updatedHarth);
  };
  const handleCancel = () => {
    setHidden();
  };

  return (
    <div className={styles.mainContainer}>
      <div className={styles.title}>Rename a harth</div>
      <form onSubmit={submitHandler} className={styles.form}>
        <input
          placeholder=""
          value={updatedHarth.name}
          onChange={nameChangeHandler}
          required
          className={styles.textEntry}
        />
        <div className={styles.buttonBar}>
          <Button
            text="Cancel"
            tier="secondary"
            onClick={handleCancel}
            className={styles.cancelButton}
          />
          <Button type="submit" text="Update" className={styles.submitButton} />
        </div>
      </form>
    </div>
  );
};

export default HarthEditModal;
