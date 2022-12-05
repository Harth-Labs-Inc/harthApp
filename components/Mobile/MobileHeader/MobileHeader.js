
import { useState, useEffect } from 'react'
import { useAuth } from '../../../contexts/auth'
import { Avatar } from'../../Common/Avatar/Avatar'
import { useComms } from '../../../contexts/comms'
import styles from "./mobileHeader.module.scss"

const MobileHeader = (props) => {

  const { currentPage } = props
  //update with logi for pulling this info
  const communityName = "Blarg"
  const profileImage = "https://thehill.com/wp-content/uploads/sites/2/2022/11/f026baa605674c8d92f28b0c1855cd8e.jpg"




  return (
    <div className={styles.topBar}>
        {currentPage}
      <Avatar isPressable={true} picSize={40} onPress="" imageSrc={profileImage} />
    </div>
  )
}

export default MobileHeader

