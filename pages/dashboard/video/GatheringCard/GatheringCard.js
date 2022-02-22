import { useEffect, useState } from 'react'
import { ellapsedTime } from '../../../../services/helper'

import UserIcon from '../../../../components/UserIcon/userIcon'
import { Button } from '../../../../components/Common'

import styles from './GatheringCard.module.scss'

const GatheringCard = ({ room, joinHandler }) => {
  let activeInterval
  const [activeTimer, setActiveTimer] = useState(ellapsedTime(room.createdTime))

  useEffect(() => {
    activeInterval = setInterval(() => {
      setActiveTimer(ellapsedTime(room.createdTime))
    }, 60000)

    console.group(activeTimer)

    return () => clearInterval(activeInterval)
  }, [])

  return (
    <div className={`${styles.gatheringCard} ${styles[room.gatheringType]}`}>
      <div className={styles.gatheringCardType}>{room.gatheringType}</div>
      <p className={styles.gatheringCardName}>{room.roomName}</p>
      <ul className={styles.gatheringCardPeersList}>
        {room.peers &&
          room.peers.map(({ img, name }) => {
            ;<UserIcon img={img} name={name} />
          })}
      </ul>
      <div className={styles.gatheringCardFooter}>
        <span className={styles.gatheringCardTimer}>
          Active
          <span>{activeTimer}</span>
        </span>
        <span>
          <button className={styles.gatheringCardJoin} onClick={joinHandler}>
            Join
          </button>
          <Button onClick={() => joinRoom(room)} text="Leave" />
        </span>
      </div>
    </div>
  )
}

export default GatheringCard
