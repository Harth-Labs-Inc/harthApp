import { useState, useEffect, useContext } from 'react'
import { useAuth } from '../../contexts/auth'
import { MobileContext } from '../../contexts/mobile'
import { ChatFill } from '../../resources/icons/ChatFill'
import { ChatNoFill  } from '../../resources/icons/ChatNoFill'

import Modal from '../Modal'
import HarthMenu from '../HarthMenu/index'

import { useComms } from '../../contexts/comms'

const MainNav = (props) => {
  const { changePage, currentPage, onToggleMenu } = props
  const [modal, setModal] = useState()
  //const [communityName, setCommunityName] = useState()
  const communityName = "Blarg"
  const [communityId, setCommunityId] = useState()
  const [harthIcon, setHarthIcon] = useState()
  const [profileIcon, setProfileIcon] = useState()
  const { isMobile } = useContext(MobileContext)
  const { user } = useAuth()
  const { comms, setComm, selectedcomm } = useComms()

  const handleHarthMenu = () => {
    if (!isMobile) {
      setModal(!modal)
    }
    if (isMobile) {
      onToggleMenu()
    }
  }

  const showModal = () => {
    setModal(!modal)
  }

  useEffect(() => {
    if (selectedcomm) {
      setCommunityName(selectedcomm.name)
      setCommunityId(selectedcomm._id)
      setHarthIcon(selectedcomm.iconKey)
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
      <header id="mainNav" className={isMobile ? 'isMobile' : 'isDesktop'}>
        <button
          id="channel"
          onClick={handleHarthMenu}
          aria-label="Current Harth"
        >
          {isMobile ? <img src={harthIcon} /> : null}
          {communityName}
        </button>
        <div role="nav" className="top-buttons">
          <button
            role="nav-item"
            id="chat"
            aria-label="Community Chat"
            className={currentPage == 'chat' ? 'active' : undefined}
            onClick={() => {
              changePage('chat')
            }}
          >
            
            {currentPage == 'chat' 
            ? <div style={{height: 32, width: 32}}><ChatFill /></div>
            : <div style={{height: 32, width: 32}}><ChatNoFill /></div>
            }
            Chat
          </button>

          <button
            role="nav-item"
            id="gather"
            aria-label="Gather"
            className={currentPage == 'gather' ? 'active' : undefined}
            onClick={() => {
              // remove page change on mobile for now
              if (!isMobile) {
                changePage('gather')
              } else {
                alert('mobile gatherings coming soon')
              }
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
        {!isMobile ? (
          <button
            id="account-btn"
            aria-label="My Account"
            className={profileIcon ? 'hasImage' : undefined}
          >
            {profileIcon ? <img src={profileIcon} /> : ''}
          </button>
        ) : null}
      </header>
    </>
  )
}

export default MainNav
