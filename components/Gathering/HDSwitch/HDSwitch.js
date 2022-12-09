import { useState, useEffect } from 'react';

import styles from './hdSwitch.module.scss';

export const HDSwitch = (props) => {
  const { onToggleChange, isChecked } = props
  const [toggle, setToggle] = useState(false)

  useEffect(() => {
    setToggle(isChecked)
  }, [isChecked])

  const triggerToggle = () => {
    onToggleChange()
    setToggle(!toggle)
  }

  return (
    <>
      <div
        onClick={triggerToggle}
        className={`${styles.Toggle} ${
          toggle ? `${styles.ToggleChecked}` : undefined
        }
  `}
      >
        <div className={styles.ToggleContainer}>
          <div className={styles.ToggleContainerBackground}></div>
          <div className={styles.ToggleContainerCircle}>
            <span></span>
          </div>
          <div className={styles.ToggleContainerLabel}>HD</div>
          <input
            className={styles.ToggleContainerInput}
            type="checkbox"
            aria-label="HD Toggle Button"
            defaultChecked={toggle}
          />
        </div>
      </div>
    </>
  )
}
