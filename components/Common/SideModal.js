import { useEffect, useState, useRef } from "react";
import OusideClick from "../OutsideClick";

const SideModal = (props) => {
  const [transitionClass, setTransitionClass] = useState();
  const { show, children, id, onToggleModal } = props;

  const ref = useRef();

  useEffect(() => {
    setTimeout(() => {
      setTransitionClass("modal_open");
    }, 4);
  }, [show]);

  OusideClick(ref, () => {
    onToggleModal();
  });

  return (
    <div id={id} className={`modal ${transitionClass}`}>
      <section ref={ref} className="modal_side">
        {children}
      </section>
    </div>
  );
};

export default SideModal;
