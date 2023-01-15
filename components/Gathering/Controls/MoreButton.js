import { useState } from "react";
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
        onClick={onPress}
      >
        <div height="100%" width="100%">
          <IconChevronLeft />
        </div>
      </button>
    </>
  );
};
