import { useRef } from 'react'
import OutsideClickHandler from '../OutsideClick'

const SideModal = (props) => {
  const { children, id, onToggleModal } = props

  const ref = useRef()

  const closeToolTip = () => {
    onToggleModal()
  }

  return (
    <div id={id} className={`modal modal_open`}>
      <OutsideClickHandler
        onClickOutside={closeToolTip}
        onFocusOutside={closeToolTip}
      >
        <section ref={ref} id="modal_side">
          {children}
        </section>
      </OutsideClickHandler>
    </div>
  )
}

export default SideModal
