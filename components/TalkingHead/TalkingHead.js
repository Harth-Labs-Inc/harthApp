import { Wizard } from "../../resources/icons/wizard";
import styles from "./TalkingHead.module.scss";

const TalkingHead = ({ text, textArray, isSmall }) => {
    return (
        <div className={isSmall ? styles.TalkingHeadSmall : styles.TalkingHead}>
            <div className={styles.HelperContainer}>
                <div className={styles.HelperContainerTextBubble}>
                    {textArray ? (
                        textArray.map((entry, idx) => <p key={idx}>{entry}</p>)
                    ) : (
                        <p className={styles.HelperContainerText}>
                            {text} 
                        </p>
                    )}
                </div>
                <div className={styles.WizardBackground}>
                <img className={styles.Wizard} src="/images/wizard.png" />
                </div>
            </div>
        </div>
    );
};

export default TalkingHead;
