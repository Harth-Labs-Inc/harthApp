import { useState } from "react";

const ToggleSwitch = () => {
  const [toggle, setToggle] = useState(false);

  const triggerToggle = () => {
    setToggle(!toggle);
  };

  return (
    <div
      onClick={triggerToggle}
      className={`toggle ${toggle ? "toggle--checked" : ""}
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
  );
};

export default ToggleSwitch;
