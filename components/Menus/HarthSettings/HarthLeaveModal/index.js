import { Button } from "Common";

import styles from "./HarthLeaveModal.module.scss";

const HarthLeaveModal = ({ setHidden, submitHarthChange, harth }) => {
    const submitHandler = async (e) => {
        e.preventDefault();
        submitHarthChange(harth);
    };
    const handleCancel = () => {
        setHidden();
    };

    return (
        <div className={styles.mainContainer}>
            <div className={styles.title}>Confirm Leave</div>
            <p>You are about to leave:</p>
            <img
                className={styles.harthImage}
                src={harth?.iconKey}
                loading="lazy"
            />
            <p className={styles.harthName}>{harth?.name}</p>
            <p className={styles.text}>You must be intived back to rejoin.</p>
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
                        text="Leave"
                        className={styles.submitButton}
                    />
                </div>
            </form>
        </div>
    );
};

export default HarthLeaveModal;
