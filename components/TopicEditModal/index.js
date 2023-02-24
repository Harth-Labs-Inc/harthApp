import React, { useEffect, useState } from "react";
import { useComms } from "../../contexts/comms";
import { Button } from "../Common";

import styles from "./TopicEditModal.module.scss";

const TopicEditModal = ({ setHidden, topic, submitTopicChange }) => {
  const [updatedTopic, setUpdatedTopic] = useState({ title: "" });

  useEffect(() => {
    if (topic) {
      setUpdatedTopic(topic);
    }
  }, [topic]);

  const nameChangeHandler = (e) => {
    const { value } = e.target;
    setUpdatedTopic({ ...updatedTopic, ["title"]: value });
  };
  const submitHandler = async (e) => {
    e.preventDefault();
    console.log(updatedTopic);
    submitTopicChange(updatedTopic);
  };
  const handleCancel = () => {
    setHidden();
  };

  return (
    <div className={styles.mainContainer}>
      <div className={styles.title}>Rename a topic</div>
      <form onSubmit={submitHandler} className={styles.form}>
        <input
          placeholder=""
          value={updatedTopic.title}
          onChange={nameChangeHandler}
          required
          className={styles.textEntry}
          autoComplete="off"
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

export default TopicEditModal;
