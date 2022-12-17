import { useEffect, useState, useCallback, useRef } from "react";
import OutsideClickHandler from "../Common/Modals/OutsideClick";
export const CustomContextMenu = ({ children, targetID }) => {
  const [showModal, setShowModal] = useState(false);
  const contextRef = useRef(null);

  const toggleEditMenu = (evt) => {
    if (evt.button === 2) {
      const targetElement = document.getElementById(targetID);
      if (targetElement && targetElement.contains(evt.target)) {
        evt.preventDefault();
        setShowModal((prevState) => !prevState);
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <OutsideClickHandler
      onClickOutside={closeModal}
      onFocusOutside={closeModal}
    >
      <div ref={contextRef} onMouseDown={toggleEditMenu}>
        {showModal && (
          <div>
            <p>test</p>
          </div>
        )}
        {children}
      </div>
    </OutsideClickHandler>
  );
};
