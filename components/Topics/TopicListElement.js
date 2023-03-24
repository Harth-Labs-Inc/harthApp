import styles from "./topics.module.scss";

const TopicListElement = (props) => {
    const {
        topic,
        clickHandler,
        isMobile = false,
        hasAlert = true,
        alertProfiles = [],
        isActive = false,
        // isShort = false,
        label = "topic name",
        toggleTopicEditModal,
        isHidden,
    } = props;

    const toggleActive = () => {
        clickHandler(topic);
    };

    const toggleEditMenu = (evt) => {
        if (evt.button === 2) {
            const targetElement = document.getElementById(topic._id);
            if (targetElement && targetElement.contains(evt.target)) {
                evt.preventDefault();
                toggleTopicEditModal({
                    topic,
                    pos: {
                        x: evt.clientX,
                        y: evt.clientY,
                    },
                    isHidden: isHidden,
                });
            }
        }
    };

    if (!topic) {
        return null;
    }

    return (
        <button
            id={topic._id}
            className={`
        ${styles.topic} 
        ${isMobile ? styles.Mobile : styles.Desktop} 
        ${isActive && styles.topicActive} 
        ${hasAlert && styles.topicAlert} 
        `}
            onClick={toggleActive}
            onMouseUp={toggleEditMenu}
        >
            <div className={styles.label}>
                <div className={styles.emojiHolder}>
                    {topic.marker ? <p>{topic.marker}</p> : <p>&#128512;</p>}
                </div>
                <p>{label}</p>
            </div>
            {hasAlert && (
                <div
                    className={` 
                        ${styles.alertProfiles}
                        ${isMobile && styles.alertProfilesMobile}
                        `}
                >
                    {alertProfiles.map((e) => {
                        return (
                            <>
                                <img
                                    src={e?.creator_image}
                                    className={`${e?.comm_id}_${e?.creator_id}`}
                                    loading="lazy"
                                />
                            </>
                        );
                    })}
                </div>
            )}
        </button>
    );
};

export default TopicListElement;
