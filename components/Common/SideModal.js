import { useEffect, useState, useRef } from "react";
import OutsideClickHandler from "../OutsideClick";

const SideModal = (props) => {
  const [transitionClass, setTransitionClass] = useState();
  const { show, children, id, onToggleModal } = props;

  const ref = useRef();

  useEffect(() => {
    setTimeout(() => {
      setTransitionClass("modal_open");
    }, 4);
  }, [show]);

  const closeToolTip = () => {
    onToggleModal();
  };

  return (
    <div id={id} className={`modal ${transitionClass}`}>
      <OutsideClickHandler
        onClickOutside={closeToolTip}
        onFocusOutside={closeToolTip}
      >
        <section ref={ref} className="modal_side">
          {children}
        </section>
      </OutsideClickHandler>
    </div>
  );
};

export default SideModal;
