import React, { useState, useContext } from 'react'
import { MobileContext } from '../../contexts/mobile'
import { CloseButton } from '../Common/Buttons/CloseButton'
import { TextBtn } from '../Common/Button'
import IconNotificationsNoFill from '../../resources/icons/IconNotificationsNoFill'

import styles from './harthMenu.module.scss'

const HarthMenu = (props) => {
  const [currentPage, setCurrentPage] = useState('profile')
  const { isMobile } = useContext(MobileContext)
  const { communityName, onToggleModal } = props

  const changePageHandler = (pg) => {
    setCurrentPage(pg)
  }

  let page
  switch (currentPage) {
    case 'members':
      page = <p>members</p>
      break
    case 'admin':
      page = <p>admin</p>
      break
    default:
      page = <p>notifications</p>
      break
  }

  return (
    <>
      <div className="modal-top"> 
      {communityName} Settings
      <div className='close-modal'><CloseButton onClick={onToggleModal}/></div>
      </div>
      <div className={styles.navTabs} role="nav">
        <button className={currentPage == 'notifications' ? styles.active : undefined}
          onClick={() => {
            changePageHandler('notifications')
          }}
        >
          <div style={{height: 24, width: 24, marginRight: 4,}}><IconNotificationsNoFill /></div>Notifications
        </button>

        <button className={currentPage == 'members' ? styles.buttonActive : undefined}
          onClick={() => {
            changePageHandler('members')
          }}
        >
          Members
        </button>

        <button className={currentPage == 'admin' ? styles.active : undefined}
          onClick={() => {
            changePageHandler('admin')
          }}
        >
          Admin
        </button>
      </div>
        

      {/* <aside className="modal_left">
        <ul id="nav_comm_preferences" role="nav">
          <li
            className={currentPage == 'premium' ? 'active' : undefined}
            role="nav-item"
          >
            <button
              onClick={() => {
                changePageHandler('premium')
              }}
            >
              Premium
            </button>
          </li>
          <li
            className={currentPage == 'members' ? 'active' : undefined}
            role="nav-item"
          >
            <button
              onClick={() => {
                changePageHandler('members')
              }}
            >
              Members
            </button>
          </li>
          <li
            className={currentPage == 'admin' ? 'active' : undefined}
            role="nav-item"
          >
            <button
              onClick={() => {
                changePageHandler('admin')
              }}
            >
              Admin
            </button>
          </li>
        </ul>
        <TextBtn text="Leave"></TextBtn>
      </aside>
      <div className="modal_right">{page}</div> */}
      <div className="modal_right">{page}</div>
    </>
  )
}

export default HarthMenu
