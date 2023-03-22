import { IconChevronLeft } from "../../../resources/icons/IconChevronLeft";
import styles from "./gatheringButtons.module.scss";

export const MoreButton = (props) => {
  const { onPress, isActive } = props;

  return (
    <>
      <button
        className={`
                ${styles.moreButton} 
                ${isActive ? styles.moreButtonActive : null}
            `}
        aria-label="More"
        onMouseDown={() => {
          if (!isActive) {
            onPress();
          }
        }}
      >
        <div height="100%" width="100%">
          <IconChevronLeft />
        </div>
      </button>
    </>
  );
};
