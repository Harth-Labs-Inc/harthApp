import { ellapsedTime } from '../../../../services/helper'

import UserIcon from '../../../../components/UserIcon/userIcon'

import styles from './GatheringCard.module.scss'

const GatheringCard = ({ room }) => {
  console.log(room, 'gatheringcard')

  ellapsedTime(room.createdTime)

  return (
    <div className={styles.gatheringCard}>
      <div className={styles.gatheringCardType}>{room.gatheringType}</div>
      <p className={styles.gatheringCardName}>{room.roomName}</p>
      <ul className={styles.gatheringCardPeersList}>
        {room.peers &&
          room.peers.map(({ img, name }) => {
            ;<UserIcon img={img} name={name} />
          })}
      </ul>
      <div className={styles.gatheringCardFooter}>
        <span className={styles.gatheringCardTimer}></span>
        <span>
          <button
            className={styles.gatheringCardJoin}
            onClick={() => joinRoom(room)}
          >
            Join
          </button>
          <button
            className={styles.gatheringCardLeave}
            onClick={() => joinRoom(room)}
          >
            Leave
          </button>
        </span>
      </div>
    </div>
  )
}

export default GatheringCard
