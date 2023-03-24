

import { Button, Modal } from "Common";



import styles from "./UserFeedback.module.scss";

export default function UserFeedback({
    closeHandler,
}) {


    
    

    return (
        <Modal onToggleModal={closeHandler}>
            <div className={styles.mainContainer}>
                <div className={styles.title}>Submit Feedback</div>
                <form
                    className={styles.form}
                >
                    <p className={styles.label}>What were you trying to do?</p>
                    <textarea
                        type="text"
                        className={styles.textEntry}
                        autoComplete="off"
                    />

                    <p className={styles.label}>What went wrong?</p>
                    <textarea
                        type="text"
                        className={styles.textEntry}
                        autoComplete="off"
                    />

                    <p className={styles.label}>Did this work before?</p>
                    <textarea
                        type="text"
                        className={` ${styles.textEntry} ${styles.textEntrySmall} `}
                        autoComplete="off"
                    />


                    <div className={styles.buttonBar}>
                        <Button
                            tier="secondary"
                            fullWidth
                            text="cancel"
                            onClick={closeHandler}
                            className={styles.cancelButton}
                        />
                        <Button
                            tier="primary"
                            fullWidth
                            text="Submit"
                            type="submit"
                            className={styles.submitButton}
                        />
                    </div>
                </form>
            </div>
        </Modal>
    );
}
