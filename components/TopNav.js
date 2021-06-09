import { useRouter } from 'next/router'
import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/auth'
import Modal from './Modal'
import HarthMenu from './HarthMenu/index'
import { useComms } from '../contexts/comms'

const TopNav = (props) => {
  const [modal, setModal] = useState()
  const [communityName, setCommunityName] = useState()
  const [communityId, setCommunityId] = useState()
  const [profileIcon, setProfileIcon] = useState()
  const { pathname } = useRouter()

  const { changePage, currentPage, onModalChange, toggleModal } = props
  const { user } = useAuth()
  const { comms, setComm, selectedcomm } = useComms()

  const showModal = () => {
    setModal(!modal)
  }

  useEffect(() => {
    if (selectedcomm) {
      setCommunityName(selectedcomm.name)
      setCommunityId(selectedcomm._id)
      selectedcomm.users.forEach((usr) => {
        if (usr.userId === user._id) {
          setProfileIcon(usr.iconKey)
        }
      })
    }
  }, [selectedcomm])

  useEffect(() => {
    if (!selectedcomm && comms && comms.length > 0) {
      setComm(comms[0])
    }
  }, [comms])

  return (
    <>
      {modal ? (
        <Modal id="comm_preferences" show={modal} onToggleModal={showModal}>
          <HarthMenu
            communityName={communityName}
            communityId={communityId}
            onToggleModal={showModal}
          />
        </Modal>
      ) : (
        ''
      )}
      <header id="dash_header">
        <button id="channel" onClick={showModal}>
          {communityName}
        </button>
        <div role="nav" className="top-buttons">
          <button
            role="nav-item"
            id="chat"
            aria-label="Community Topics"
            className={currentPage == 'chat' ? 'active' : undefined}
            onClick={() => {
              changePage('chat')
            }}
          >
            Chat
          </button>

          <button
            role="nav-item"
            id="notes"
            aria-label="Notes"
            className={currentPage == 'notes' ? 'active' : undefined}
          >
            Notes
          </button>

          <button
            role="nav-item"
            id="gather"
            aria-label="Gather"
            className={currentPage == 'gather' ? 'active' : undefined}
            onClick={() => {
              changePage('gather')
            }}
          >
            Gather
          </button>

          <button
            role="nav-item"
            id="events"
            aria-label="Community Events Calendar"
            className={currentPage == 'events' ? 'active' : undefined}
            onClick={() => {
              changePage('events')
            }}
          >
            Events
          </button>
        </div>
        <button
          id="account-btn"
          aria-label="My Account"
          className={profileIcon ? 'hasImage' : undefined}
        >
          {profileIcon ? <img src={profileIcon} /> : ''}
        </button>
      </header>
    </>
  )
}

export default TopNav
