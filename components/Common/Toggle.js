import { useState, useEffect } from 'react'

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
      className={`toggle ${toggle ? 'toggle--checked' : undefined}
    `}
    >
      <div className="toggle_container">
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
