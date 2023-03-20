import { Button } from "Common";

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
            <div className={styles.title}>!Confirm Delete!</div>
            <p>You are about to delete:</p>
            <img
                className={styles.harthImage}
                src={harth?.iconKey}
                loading="lazy"
            />
            <p className={styles.harthName}>{harth?.name}</p>
            <p className={styles.text}>
                THIS CANNOT BE UNDONE.
                <p>
                    ALL USERS WILL BE REMOVED AND THEIR CONTENT IN THIS
                    H&Auml;RTH WILL BE DELETED.
                </p>
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

export default HarthDeleteModal;
