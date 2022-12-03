import { HarthLogoDark } from "../../public/images/harth-logo-dark";
import { Wizard } from "../../resources/icons/wizard";
import styles from "./TalkingHead.module.scss";

const TalkingHead = ({ text }) => {
    return (
        <div className={styles.TalkingHead}>
            <div className={styles.TalkingHeadLogo}>
                <HarthLogoDark />
            </div>
            <div className={styles.TalkingHeadHelperContainer}>
                <div className={styles.TalkingHeadHelperContainerTextBubble}>
                    <p className={styles.TalkingHeadHelperContainerText}>
                        {text}
                    </p>
                </div>
                <div className={styles.TalkingHeadHelperContainerImage}>
                    <Wizard />
                </div>
            </div>
        </div>
    );
};

export default TalkingHead;
