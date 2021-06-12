import React, { useState } from 'react'

import { CloseBtn, TextBtn } from '../Common/Button'

const HarthMenu = (props) => {
  const [currentPage, setCurrentPage] = useState('profile')

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
      page = <p>premium</p>
      break
  }

  return (
    <>
      <div className="modal-top">
        <p>{communityName}</p>
        <CloseBtn onClick={onToggleModal}></CloseBtn>
      </div>
      <aside className="modal_left">
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
      <div className="modal_right">{page}</div>
    </>
  )
}

export default HarthMenu
