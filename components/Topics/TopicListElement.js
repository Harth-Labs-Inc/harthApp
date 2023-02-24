import styles from "./topics.module.scss";

const TopicListElement = (props) => {
  const {
    topic,
    clickHandler,
    isMobile = false,
    hasAlert = true,
    alertProfiles = [],
    isActive = false,
    isShort = false,
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
        ${isMobile && styles.topicMobile} 
        ${isActive ? styles.topicActive : styles.topicInActive} 
        ${hasAlert && styles.topicAlert} 
        `}
      onClick={toggleActive}
      onMouseUp={toggleEditMenu}
    >
      <div className={styles.labelHolder}>
        <div className={styles.emojiHolder}>
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Twemoji_1f600.svg/1024px-Twemoji_1f600.svg.png" 
            loading="lazy"
            />
        </div>
        <div className={styles.label}>{label}</div>
      </div>
      {hasAlert && (
        <div
          className={` 
          ${styles.alertProfiles}
          ${isMobile && styles.alertProfilesMobile}
          `}
        >
          {alertProfiles.map((e) => {
            console.log(e);
            return (

              <img
                src={e?.creator_image}
                className={`${e?.comm_id}_${e?.creator_id}`}
                loading="lazy"
              />

            );
          })}
        </div>
      )}
    </button>
  );
};

export default TopicListElement;
