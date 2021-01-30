const Modal = ({ handleClose, show, children }) => {
  const showClassName = show ? "modal_open" : "";

  return (
    <div className={`modal ${showHideClassName}`}>
      <section className="modal_main">{children}</section>
    </div>
  );
};

export default Modal;
