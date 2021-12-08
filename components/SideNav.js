import { useState, useRef } from 'react'
import { useAuth } from '../contexts/auth'
import { useComms } from '../contexts/comms'
import { useSocket } from '../contexts/socket'
import Modal from './Modal'
import SideModal from './Common/SideModal'
import SettingsMenu from './SettingsMenu/index'
import CommBuilder from '../pages/comm'

const SideNav = (props) => {
  const [ShowCommBuilder, setShowCommBuilder] = useState(false)
  const [ShowSettingsNav, setShowSettingsNav] = useState(false)

  const { comms, setComm, selectedcomm, setTopic } = useComms()
  const { unreadMsgs } = useSocket()
  const { user } = useAuth()

  let leftNav = useRef()
  const { toggleTavern } = props

  const changeSelectedCom = (com) => {
    toggleTavern(false)
    setComm(com)
    setTopic({})
  }
  const toggleDefaultComm = () => {
    setComm()
    toggleTavern(true)
  }
  const toggleCreateComm = () => {
    setShowCommBuilder(!ShowCommBuilder)
  }
  const toggleSettingsNav = () => {
    setShowSettingsNav(!ShowSettingsNav)
  }
  // const expandMenu = () => {
  //   leftNav.current.className = 'expand'
  // }
  // const collapseMenu = () => {
  //   leftNav.current.className = ''
  // }

  const DisplayCommBuilder = () => {
    if (ShowCommBuilder) {
      return (
        <Modal onToggleModal={toggleCreateComm}>
          <CommBuilder />
        </Modal>
      )
    }
    return null
  }
  const DisplaySettingsNav = () => {
    if (ShowSettingsNav) {
      return (
        <SideModal onToggleModal={toggleSettingsNav}>
          <SettingsMenu />
        </SideModal>
      )
    }
    return null
  }

  return (
    <>
      <DisplayCommBuilder />
      <DisplaySettingsNav />

      <aside id="left_nav" ref={leftNav}>
        <ul
          id="left_nav_comms"
          // onMouseOver={expandMenu}
          // onMouseLeave={collapseMenu}
        >
          <li id="left_nav_comms_default" aria-label="nav-item">
            <button onClick={toggleDefaultComm}>
              <span className="comm-icon-wrapper">
                <span className="comm-icon"></span>
              </span>
              {/* <span className="comm-name">The Tavern</span> */}
            </button>
          </li>
          {comms &&
            comms.map((com) => {
              let classes = []
              if (selectedcomm && com._id === selectedcomm._id) {
                classes.push('active')
              } else {
                unreadMsgs.forEach((msg) => {
                  if (msg.comm_id === com._id && msg.creator_id !== user._id) {
                    classes.push('com-new-message')
                  }
                })
              }

              return (
                <li
                  className={classes.join(' ')}
                  aria-label="nav-item"
                  key={com._id}
                >
                  <button
                    onClick={() => {
                      changeSelectedCom(com)
                    }}
                    aria-label={com.name}
                    className={com.iconKey ? 'hasImage' : undefined}
                  >
                    {com.iconKey ? (
                      <span className="comm-icon-wrapper">
                        <img className="comm-icon" src={com.iconKey} />
                      </span>
                    ) : (
                      <span className="comm-icon-wrapper">
                        <span className="comm-icon"></span>
                      </span>
                    )}
                    {/* <span className="comm-name">{com.name}</span> */}
                  </button>
                </li>
              )
            })}
          <li id="left_nav_comms_new" aria-label="nav-item">
            <button onClick={toggleCreateComm}></button>
          </li>
        </ul>

        <button
          onClick={toggleSettingsNav}
          aria-label="Toggle Settings menu"
          id="settings_toggle"
        ></button>
      </aside>
    </>
  )
}

export default SideNav
