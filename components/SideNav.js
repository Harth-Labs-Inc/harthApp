import React, { useState, useRef } from 'react'
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

  let leftNav = useRef()

  const changeSelectedCom = (com) => {
    setComm(com)
    setTopic({})
  }
  const toggleCreateComm = () => {
    setShowCommBuilder(!ShowCommBuilder)
  }
  const toggleSettingsNav = () => {
    setShowSettingsNav(!ShowSettingsNav)
  }
  const expandMenu = () => {
    leftNav.current.className = 'expand'
  }
  const collapseMenu = () => {
    leftNav.current.className = ''
  }

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
          onMouseOver={expandMenu}
          onMouseLeave={collapseMenu}
        >
          {comms &&
            comms.map((com) => {
              let activeCom = false
              if (selectedcomm && com._id === selectedcomm._id) {
                activeCom = true
                Object.values(unreadMsgs)
                  .flat()
                  .forEach((msg) => {
                    console.log(msg)
                  })
              }
              return (
                <li
                  className={activeCom ? 'active' : undefined}
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
                      <img className="comm-icon" src={com.iconKey} />
                    ) : (
                      <span className="comm-icon"></span>
                    )}
                    <span className="comm-name">{com.name}</span>
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
