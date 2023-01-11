import React from "react";

import { Button } from "../../Common/Buttons/Button";

import styles from "./ConversationDeleteModal.module.scss";

const ConversationDeleteModal = ({ setHidden, submitTopicChange, topic }) => {
    const submitHandler = async (e) => {
        e.preventDefault();
        console.log(topic);
        submitTopicChange(topic);
    };
    const handleCancel = () => {
        setHidden();
    };

    return (
        <div className={styles.mainContainer}>
            <div className={styles.title}>Confirm Delete</div>
            <p>you are about to delete</p>
            <p>{topic?.title}</p>
            <p>
                the topic will be deleted and all content will be deleted. This
                cannot be undone
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
                        text="DELETE"
                        className={styles.submitButton}
                    />
                </div>
            </form>
        </div>
    );
};

export default ConversationDeleteModal;
