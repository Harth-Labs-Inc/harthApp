import { Button } from "Common";

import styles from "./ConversationDeleteModal.module.scss";

const ConversationDeleteModal = ({ setHidden, submitTopicChange, topic }) => {
    const submitHandler = async (e) => {
        e.preventDefault();
        submitTopicChange(topic);
    };
    const handleCancel = () => {
        setHidden();
    };

    return (
        <div className={styles.mainContainer}>
            <div className={styles.title}>Confirm Removal</div>
            <p className={styles.text}>
                You are about to remove this conversation from your message
                history:
            </p>
            <div className={styles.conversation}>{topic?.title}</div>
            <p className={styles.subtext}>
                This conversation will be removed. This cannot be undone.
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
                        text="Remove"
                        className={styles.submitButton}
                    />
                </div>
            </form>
        </div>
    );
};

export default ConversationDeleteModal;
