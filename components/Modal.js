import { useEffect, useState } from "react";

const Modal = (props) => {
  const [transitionClass, setTransitionClass] = useState();
  const { show, children, id, onToggleModal } = props;

  useEffect(() => {
    setTimeout(() => {
      setTransitionClass("modal_open");
    }, 4);
  }, [show]);

  return (
    <div id={id} className={`modal ${transitionClass}`} onClick={onToggleModal}>
      <section className="modal_main">{children}</section>
    </div>
  );
};

export default Modal;
