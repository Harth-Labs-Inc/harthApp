import { useState, useEffect } from 'react'
import { useAuth } from '../../../contexts/auth'
import { MobileNavButton } from './MobileNavButton'
//import { MobileContext } from '../../../contexts/mobile'
import Modal from '../../Modal'
import HarthMenu from '../../HarthMenu/index'
import styles from './mobileNav.module.scss'

import { useComms } from '../../../contexts/comms'




const MobileNav = (props) => {
  const { changePage, currentPage, onToggleMenu } = props
  const [modal, setModal] = useState()
  //const [communityName, setCommunityName] = useState()
  const communityName = "Blarg"
  const [communityId, setCommunityId] = useState()
  //const [harthIcon, setHarthIcon] = useState()
  const harthIcon = "https://d1mc7wmz9xfkdm.cloudfront.net/eyJidWNrZXQiOiJhc3NldHMud29vZGxhbmRkaXJlY3QuY29tIiwia2V5IjoicHJvZHVjdC1pbWFnZXMvUGV0ZXJzb24tUmVhbC1GeXJlLVJ1c3RpYy1PYWstVmVudGVkLUdhcy1Mb2ctU2V0LW1haW4uanBnIiwiZWRpdHMiOnsicmVzaXplIjp7IndpZHRoIjoxMjAwLCJoZWlnaHQiOjEyMDAsImZpdCI6ImNvbnRhaW4iLCJiYWNrZ3JvdW5kIjp7InIiOjI1NSwiZyI6MjU1LCJiIjoyNTUsImFscGhhIjoxfX19fQ=="

  
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
    
      <div aria-label="Navigation" className={styles.mobile}>
        <button
          className={styles.harthButton}
          onClick={showModal}
          aria-label="Current Harth"
        >
          <img className={styles.harthImage} src={harthIcon} />
        </button>

        {currentPage == 'chat'
          ? <MobileNavButton label="Chat" isActive={true} command={() => {changePage('chat')}}/>
          : <MobileNavButton label="Chat" isActive={false} command={() => {changePage('chat')}}/>
        }

        {currentPage == 'gather'
          ? <MobileNavButton label="Gather" isActive={true} command={() => {changePage('gather')}}/>
          : <MobileNavButton label="Gather" isActive={false} command={() => {changePage('gather')}}/>
        }

        {currentPage == 'message'
          ? <MobileNavButton label="Message" isActive={true} command={() => {changePage('message')}}/>
          : <MobileNavButton label="Message" isActive={false} command={() => {changePage('message')}}/>
        }

      </div>
    </>
  )
}

export default MobileNav
