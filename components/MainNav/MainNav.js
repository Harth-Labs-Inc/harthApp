import { useState, useEffect, useContext } from 'react'
import { useAuth } from '../../contexts/auth'
import { MobileContext } from '../../contexts/mobile'
import { ChatFill } from '../../resources/icons/ChatFill'
import { ChatNoFill  } from '../../resources/icons/ChatNoFill'
import { FireFill } from '../../resources/icons/FireFill'
import { FireNoFill  } from '../../resources/icons/FireNoFill'
import { ForumFill } from '../../resources/icons/ForumFill'
import { ForumNoFill  } from '../../resources/icons/ForumNoFill'

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
        <div style={{width: 240,}}>
        <button
          id="harth-title"
          onClick={handleHarthMenu}
          aria-label="Current Harth"
        >
          {isMobile ? <img src={harthIcon} /> : communityName}
          
        </button>
        </div>
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
            <div style={{display: 'flex', flexDirection: 'row', width: '100%', flex: 1, alignItems: 'center', justifyContent: 'center'}}>
              {currentPage == 'chat'
              ? <div style={{height: 22, width: 22, marginRight: 4,}}><ChatFill color="#f0f"/></div>
              : <div style={{height: 22, width: 22, marginRight: 4,}}><ChatNoFill /></div>
              }
              Chat
            </div>
            {currentPage == 'chat'
            ? <div id="indicator"></div>
            : <div style={{height: 5, backgroundColor: 'transparent',}}></div>
            }
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
            <div style={{display: 'flex', flexDirection: 'row', flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center'}}>
              {currentPage == 'gather'
              ? <div style={{height: 24, width: 24, marginRight: 4,}}><FireFill /></div>
              : <div style={{height: 24, width: 24, marginRight: 4,}}><FireNoFill /></div>
              }
              Gather
            </div>
            {currentPage == 'gather'
            ? <div id="indicator"></div>
            : <div style={{height: 5, backgroundColor: 'transparent',}}></div>
            }
          </button>

          <button
            role="nav-item"
            id="message"
            aria-label="Private Messages"
            className={currentPage == 'message' ? 'active' : undefined}
            onClick={() => {
              changePage('message')
            }}
          >
            <div style={{display: 'flex', flexDirection: 'row', flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center'}}>
              {currentPage == 'message'
              ? <div style={{height: 24, width: 24, marginRight: 4,}}><ForumFill /></div>
              : <div style={{height: 24, width: 24, marginRight: 4,}}><ForumNoFill /></div>
              }
              Chat
            </div>
            {currentPage == 'message'
            ? <div id="indicator"></div>
            : <div style={{height: 5, backgroundColor: 'transparent',}}></div>
            }
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
