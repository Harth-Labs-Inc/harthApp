import { useEffect } from "react";
import { Avatar } from "../../Common/Avatar/Avatar";
import { IconDiceD8 } from "../../../resources/icons/IconDiceD8";
import { IconDiceD6 } from "../../../resources/icons/IconDiceD6";
import { IconDiceD4 } from "../../../resources/icons/IconDiceD4";
import { IconDiceD10 } from "../../../resources/icons/IconDiceD10";
import { IconDiceD12 } from "../../../resources/icons/IconDiceD12";
import { IconDiceD20 } from "../../../resources/icons/IconDiceD20";

import styles from "./gatherTools.module.scss";

export const DiceAlert = (props) => {
  const {
    rollResult = 0,
    profileImage,
    dice = 20,
    roll,
    removeDiceALert,
  } = props;

  const onClick = () => removeDiceALert(roll.id);

  useEffect(() => {
    setTimeout(onClick, 3000);
  }, [roll.id]);

  return (
    <>
      <div className={styles.alertContainer}>
        <div className={styles.contents}>
          <div className={styles.label}>{rollResult}</div>
          <div className={styles.attributeContainer}>
            {dice == 20 && (
              <div className={styles.icon}>
                <IconDiceD20 />
              </div>
            )}
            {dice == 12 && (
              <div className={styles.icon}>
                <IconDiceD12 />
              </div>
            )}
            {dice == 10 && (
              <div className={styles.icon}>
                <IconDiceD10 />
              </div>
            )}
            {dice == 8 && (
              <div className={styles.icon}>
                <IconDiceD8 />
              </div>
            )}
            {dice == 6 && (
              <div className={styles.icon}>
                <IconDiceD6 />
              </div>
            )}
            {dice == 4 && (
              <div className={styles.icon}>
                <IconDiceD4 />
              </div>
            )}

            <div className={styles.avatarWrapper}>
              <img src={profileImage} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
