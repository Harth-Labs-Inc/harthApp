import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/auth'
import Modal from './Modal'
import HarthMenu from './HarthMenu/index'
import { useComms } from '../contexts/comms'

const TopNav = (props) => {
  const [modal, setModal] = useState()
  const [communityName, setCommunityName] = useState()
  const [communityId, setCommunityId] = useState()
  const [profileIcon, setProfileIcon] = useState()

  const { changePage, currentPage } = props
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
            Topics
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
            id="messages"
            aria-label="Private Messages"
            className={currentPage == 'messages' ? 'active' : undefined}
            onClick={() => {
              changePage('messages')
            }}
          >
            Messages
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
