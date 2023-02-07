import React from "react";

import { Button } from "../../../Common";

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
            <div className={styles.title}>!Confirm Leave</div>
            <p>you are about to leave</p>
            <p>{harth?.name}</p>
            <p>This cannot be undone.</p>
            <p>You must be intived back to rejoin.</p>
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

export default HarthLeaveModal;
