import { useState, useEffect,} from 'react'
import { useAuth } from '../../../contexts/auth'
import {DesktopNavButton} from './DesktopNavButton'
import Modal from '../../Modal'
import HarthMenu from '../../HarthMenu/index'
import { Avatar } from '../../Universal/Avatar/Avatar'

import styles from './desktopNav.module.scss'

import { useComms } from '../../../contexts/comms'




const DesktopNav = (props) => {
  const { changePage, currentPage, onToggleMenu } = props
  const [modal, setModal] = useState()
  //const [communityName, setCommunityName] = useState()
  const communityName = "Blarg"
  const [communityId, setCommunityId] = useState()
  const [harthIcon, setHarthIcon] = useState()
  const [profileIcon, setProfileIcon] = useState()
  //update with logic for image pull
  const profileImage = "https://thehill.com/wp-content/uploads/sites/2/2022/11/f026baa605674c8d92f28b0c1855cd8e.jpg"

  
  const { user } = useAuth()
  const { comms, setComm, selectedcomm } = useComms()



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
    
      <header className={styles.desktop}>
        <div style={{width: 240,}}>
        <button
          //id="harth-title"
          className={styles.harthTitle}
          onClick={showModal}
          aria-label="Current Harth"
        >
          {communityName} 
        </button>
        </div>
        <div role="nav" className={styles.topButtons}>

          {currentPage == 'chat'
            ? <DesktopNavButton label="Chat" isActive={true} command={() => {changePage('chat')}}/>
            : <DesktopNavButton label="Chat" isActive={false} command={() => {changePage('chat')}}/>
          }

          {currentPage == 'gather'
            ? <DesktopNavButton label="Gather" isActive={true} command={() => {changePage('gather')}}/>
            : <DesktopNavButton label="Gather" isActive={false} command={() => {changePage('gather')}}/>
          }

          {currentPage == 'message'
            ? <DesktopNavButton label="Message" isActive={true} command={() => {changePage('message')}}/>
            : <DesktopNavButton label="Message" isActive={false} command={() => {changePage('message')}}/>
          }

        </div>
        {/* Replace onPress method with profile logic */}
        <Avatar aLabel="My Account" isPressable={true} onPress={showModal} picSize={36} imageSrc={profileImage} />
        
      </header>
    </>
  )
}

export default DesktopNav
