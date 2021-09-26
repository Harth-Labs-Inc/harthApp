import { useState, useEffect } from 'react'

import styles from '../../styles/config/Toggle.module.scss'

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
      className={`${styles.toggle} ${toggle ? 'toggle--checked' : undefined}
    `}
    >
      <div className={styles.container}>
        <div className="toggle_container_bg"></div>
        <div className="toggle_container_circle">
          <span></span>
        </div>
        <input
          className="toggle_container_input"
          type="checkbox"
          aria-label="Toggle Button"
          defaultChecked={toggle}
        />
      </div>
    </div>
  )
}

export default ToggleSwitch
