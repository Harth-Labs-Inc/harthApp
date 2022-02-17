import { useState, useEffect } from 'react'

import styles from './Toggle.module.scss'

const ToggleSwitch = (props) => {
  const [toggle, setToggle] = useState(false)

  const { onToggleChange, toggleName, isChecked } = props

  useEffect(() => {
    if (isChecked) {
      setToggle(true)
    }
  }, [isChecked])

  const triggerToggle = () => {
    onToggleChange(toggleName, !toggle)
    setToggle(!toggle)
  }

  return (
    <div
      onClick={triggerToggle}
      className={`${styles.Toggle} ${toggle ? 'ToggleChecked' : undefined}
    `}
    >
      <div className={styles.ToggleContainer}>
        <div className={styles.ToggleContainerBackground}></div>
        <div className={styles.ToggleContainerCircle}>
          <span></span>
        </div>
        <input
          className={styles.ToggleContainerInput}
          type="checkbox"
          aria-label="Toggle Button"
          defaultChecked={toggle}
        />
      </div>
    </div>
  )
}

export default ToggleSwitch
