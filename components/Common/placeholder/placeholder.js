
import styles from "./placeholder.module.scss";

const Placeholder = () => {
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      onTouchStart={(event) => event.stopPropagation()}
      onTouchEnd={(event) => event.stopPropagation()}
      className={styles.placeholder}

    >
    </div>
  );
};
export default Placeholder;
