import { Wizard } from "../../resources/icons/wizard";
import styles from "./TalkingHead.module.scss";

const TalkingHead = ({ text, textArray }) => {
    return (
        <div className={styles.TalkingHead}>
            <div className={styles.TalkingHeadHelperContainer}>
                <div className={styles.TalkingHeadHelperContainerTextBubble}>
                    {textArray ? (
                        textArray.map((entry, idx) => <p key={idx}>{entry}</p>)
                    ) : (
                        <p className={styles.TalkingHeadHelperContainerText}>
                            {text}
                        </p>
                    )}
                </div>
                <div className={styles.TalkingHeadHelperContainerImage}>
                    <Wizard />
                </div>
            </div>
        </div>
    );
};

export default TalkingHead;
