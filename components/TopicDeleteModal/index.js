import React from "react";

import { Button } from "../Common";

import styles from "./TopicDeleteModal.module.scss";

const TopicDeleteModal = ({ setHidden, submitTopicChange, topic }) => {
    const submitHandler = async (e) => {
        e.preventDefault();
        submitTopicChange(topic);
    };
    const handleCancel = () => {
        setHidden();
    };

    return (
        <div className={styles.mainContainer}>
            <div className={styles.title}>Confirm Delete</div>
            <p className={styles.text}>you are about to delete the topic:</p>
            <div className={styles.topic}>{topic?.title}</div>
            <p className={styles.subtext}>
                The topic will be deleted and all content will be erased. This
                cannot be undone.
            </p>
            <form onSubmit={submitHandler} className={styles.form}>
                <div className={styles.buttonBar}>
                    <Button
                        text="Cancel"
                        tier="secondary"
                        onClick={handleCancel}
                        className={styles.cancelButton}
                    />
                    <Button
                        type="submit"
                        text="Delete"
                        className={styles.submitButton}
                    />
                </div>
            </form>
        </div>
    );
};

export default TopicDeleteModal;
