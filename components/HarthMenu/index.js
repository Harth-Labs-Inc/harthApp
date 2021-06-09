import React, { useState } from 'react'
import { sendInvite } from '../../requests/community'
import { validateEmail } from '../../services/helper'

import Profile from './Profile'

import { Button, CloseBtn, BackBtn } from '../Common/Button'
import Form from '../Form-comp'
import Input from '../Common/Input'

const HarthMenu = (props) => {
  const [currentPage, setCurrentPage] = useState('profile')
  const [customErrors, setCustomErrors] = useState({ email: '' })
  // invite page
  const [inputData, setInputData] = useState({ email: '' })
  const [noteData, setNotetData] = useState('')
  const [errorData, setErrorData] = useState({ email: false })
  const [emailList, setEmailList] = useState(new Set())

  const { communityName, communityId, onToggleModal } = props

  const changePageHandler = (pg) => {
    setCurrentPage(pg)
  }

  const submitHandler = async () => {
    if (emailList.size > 0) {
      ;[...emailList].forEach(async (e) => {
        const data = await sendInvite(e, communityId, noteData)
        const { ok, errors } = data
        if (ok) {
          setInvitesSent(true)
          setInputData({ email: '' })
          setNotetData('')
        }
      })
    } else {
      if (inputData.email) {
        if (!validateEmail(inputData.email)) {
          setCustomErrors({ email: 'Email Is Not Valid' })
        } else {
          setCustomErrors({ email: '' })
          const data = await sendInvite(inputData.email, communityId, noteData)
          const { ok, errors } = data
          if (ok) {
            setInvitesSent(true)
            setInputData({ email: '' })
            setNotetData('')
          }
        }
      } else {
        setCustomErrors({ email: 'Field is Required' })
      }
    }
  }

  const inputChangeHandler = (eData, data) => {
    setErrorData(eData)
    setInputData(data)
  }

  //Community Profile Settings

  //Community Premium

  //Community Invite
  const InviteNoteHandler = (e) => {
    const { value } = e.target
    setNotetData(value)
  }

  const setMissing = (missing) => {
    setErrorData(missing)
  }

  let page
  switch (currentPage) {
    case 'premium':
      page = <p>premium</p>
      break
    case 'members':
      page = <p>members</p>
      break
    case 'admin':
      page = <p>admin</p>
      break
    default:
      page = <Profile></Profile>
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
            className={currentPage == 'profile' ? 'active' : undefined}
            role="nav-item"
          >
            <button
              onClick={() => {
                changePageHandler('profile')
              }}
            >
              My Profile
            </button>
          </li>
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
        <button>Leave</button>
      </aside>
      <div className="modal_right">{page}</div>
    </>
  )
}

export default HarthMenu
