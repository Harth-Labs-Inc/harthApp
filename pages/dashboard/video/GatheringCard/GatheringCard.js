import { useEffect, useState } from 'react'

import {
  ellapsedTime,
  convertToMilitaryTime,
} from '../../../../services/helper'
import { useGatheringFormState as gatheringFormState } from '../GatherForm/GatheringFormContext'
import { useGatheringFormState as gatheringEditFormState } from '../GatherEditForm/GatheringFormContext'

import UserIcon from '../../../../components/UserIcon/userIcon'
import { Button } from '../../../../components/Common/Buttons/Button'
import { useVideo } from '../../../../contexts/video'
import styles from './GatheringCard.module.scss'
import {
  deleteScheduledRoom,
  updateScheduleRoom,
} from '../../../../requests/rooms'

const GatheringCard = ({
  room,
  joinHandler,
  user,
  cardType,
  peers,
  owner,
  editScheduleRoom,
}) => {
  let activeInterval
  const [activeTimer, setActiveTimer] = useState(ellapsedTime(room.createdTime))
  const [isInRoom, setIsInRoom] = useState(false)

  const { refreshScheduledCallRooms } = useVideo()
  let results = {}

  if (cardType === 'schedule') {
    results = gatheringEditFormState()
  } else {
    results = gatheringFormState()
  }
  const state = results?.state
  const dispatch = results?.dispatch

  useEffect(() => {
    let inRoom = peers?.find((peer) => {
      return peer?.name === user?.name
    })
    setIsInRoom(inRoom)
  }, [peers])

  useEffect(() => {
    activeInterval = setInterval(() => {
      setActiveTimer(ellapsedTime(room.createdTime))
    }, 60000)

    return () => clearInterval(activeInterval)
  }, [])

  const editScheduleRoomHandler = () => {
    room.gatheringTime = convertToMilitaryTime(room.gatheringTime)

    dispatch({
      type: 'GATHERING_EDIT',
      payload: room,
    })

    editScheduleRoom(state)
  }

  const ButtonHandler = () => {
    if (cardType === 'schedule') {
      if (owner) {
        return (
          <>
            <Button
              textLabel="Edit"
              tier="secondary"
              className={styles.gatheringCardEdit}
              onClick={editScheduleRoomHandler}
            />
            <Button
              onClick={async () => {
                await deleteScheduledRoom(room._id)
                refreshScheduledCallRooms(room)
              }}
              textLabel="Delete"
              tier="secondary"
              className={styles.gatheringCardDelete}
            />
          </>
        )
      } else if (isInRoom) {
        return (
          <Button
            onClick={async () => {
              let tempRoom = { ...room }
              tempRoom.acceptedPeers = tempRoom.acceptedPeers.filter(
                (peer) => peer.name !== user.name,
              )
              await updateScheduleRoom(tempRoom)
              refreshScheduledCallRooms(room)
            }}
            text="Drop"
          />
        )
      } else {
        return (
          <Button
            onClick={async () => {
              let tempRoom = { ...room }
              tempRoom.acceptedPeers.push({ ...user, img: user.iconKey })
              await updateScheduleRoom(tempRoom)
              refreshScheduledCallRooms(room)
            }}
            text="Accept"
          />
        )
      }
    } else {
      return (
        <>
          <button className={styles.gatheringCardJoin} onClick={joinHandler}>
            Join
          </button>
          {isInRoom ? (
            <Button onClick={() => joinRoom(room)} text="Leave" />
          ) : null}
        </>
      )
    }
  }

  const GatheringTimer = () => {
    if (cardType === 'schedule') {
      console.log(room)
      return null
    } else {
      return (
        <>
          Active
          <span>{activeTimer}</span>
        </>
      )
    }
  }

  return (
    <div
      className={`${styles.gatheringCard} ${styles[room.gatheringType]} ${
        cardType === 'schedule'
          ? styles.gatheringCardScheduled
          : styles.gatheringCardActive
      }`}
    >
      <div className={styles.gatheringCardType}>{room.gatheringType}</div>
      <p className={styles.gatheringCardName}>{room.roomName}</p>
      <p className={styles.gatheringCardDescription}>
        {room.gatheringDescription}
      </p>
      <ul className={styles.gatheringCardPeersList}>
        {peers &&
          peers.map(({ img, name }) => {
            return (
              <UserIcon
                img={img}
                name={name}
                key={name}
                showName={false}
                size="small"
              />
            )
          })}
      </ul>
      <div className={styles.gatheringCardFooter}>
        <span className={styles.gatheringCardTimer}>
          <GatheringTimer />
        </span>
        <span>
          <ButtonHandler />
        </span>
      </div>
    </div>
  )
}

export default GatheringCard
