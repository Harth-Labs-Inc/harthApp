import React, { useState, useEffect } from 'react'
import { connectUserToRoom } from '../../../requests/rooms'
import { useAuth } from '../../../contexts/auth'
import { useComms } from '../../../contexts/comms'
import { saveRoom } from '../../../requests/rooms'
import { useSocket } from '../../../contexts/socket'

const Game = (props) => {
  const [showNewRoom, setShowNewRoom] = useState(false)
  const [newRoom, setNewRoom] = useState({ room_type: 'classic' })
  const [roomsArr, setRoomsArr] = useState([])

  const { rooms, selectedcomm, setRooms } = useComms()
  const { user } = useAuth()
  const { emitUpdate, incomingRoom, incomingRoomUpdate } = useSocket()

  useEffect(() => {
    if (rooms && selectedcomm) {
      setRoomsArr(rooms[selectedcomm._id])
    }
  }, [rooms, selectedcomm])

  useEffect(() => {
    if (incomingRoom._id) {
      let tempRms = roomsArr
      let rms = [incomingRoom, ...tempRms]
      setRooms({ ...rooms, [selectedcomm._id]: rms })
    }
  }, [incomingRoom])

  useEffect(() => {
    if (incomingRoomUpdate._id) {
      let { updateDetails, active_users } = incomingRoomUpdate

      switch (updateDetails) {
        case 'user update':
          roomsArr.forEach((rm) => {
            if (rm._id == incomingRoomUpdate._id) {
              rm.active_users = incomingRoomUpdate.active_users
            }
          })
          break
        default:
          break
      }
    }
  }, [incomingRoomUpdate])

  const toggleShowNewRoom = () => {
    setShowNewRoom(!showNewRoom)
  }
  const addNewRoom = async (e) => {
    e.preventDefault()
    if (selectedcomm) {
      let room = {
        ...newRoom,
        comm_id: selectedcomm._id,
        creator_id: user._id,
        active_users: [],
      }

      const data = await saveRoom(room)

      let { id, ok } = data || {}
      if (ok) {
        if (id) {
          room._id = id
          broadcastRoom(room)
        }
      }
    }
  }
  const broadcastRoom = (room) => {
    setNewRoom({})
    setShowNewRoom(false)
    room.updateType = 'new room'
    emitUpdate(selectedcomm._id, room, async (err, status) => {
      if (err) {
        console.log(err)
      }
      let { ok } = status
      if (ok) {
        console.log('Room sent')
      }
    })
  }
  const broadcastUpdate = (room, roomOpen) => {
    emitUpdate(selectedcomm._id, room, async (err, status) => {
      if (err) {
        console.log(err)
      }
      let { ok } = status
      if (ok) {
        if (roomOpen) {
          let urls = {
            development: 'http://localhost:3000/',
            production: 'https://project-blarg-next.vercel.app/',
          }
          window.open(
            `${urls[process.env.NODE_ENV]}?gather_window=true&room_type=${
              room.room_type
            }&comm_id=${selectedcomm._id}&room_id=${room._id}`,
          )
        }
      }
    })
  }
  const changeHandler = (e) => {
    const { value, name } = e.target
    setNewRoom({ ...newRoom, [name]: value })
  }
  const joinRoom = async (room) => {
    let creator = selectedcomm.users.find((usr) => usr.userId === user._id)
    await connectUserToRoom(creator, room._id)

    room.active_users.push(creator)
    room.updateType = 'room update'
    room.updateDetails = 'user update'
    broadcastUpdate(room, true)
  }
  const leaveRoom = (room) => {
    let filteredusrs = room.active_users.filter(
      (usr) => usr.userId !== user._id,
    )

    room.active_users = filteredusrs
    room.updateType = 'room update'
    room.updateDetails = 'user update'
    broadcastUpdate(room)
  }

  return (
    <>
      {roomsArr &&
        roomsArr.map((room, index) => {
          let isActive = (room.active_users || []).find(
            (usr) => usr.userId === user._id,
          )

          return (
            <div key={index}>
              {room.name}
              <ul>
                {room.active_users &&
                  room.active_users.map((usr) => {
                    return <p>user</p>
                  })}
              </ul>
              {isActive ? (
                <button onClick={() => leaveRoom(room)}>leave</button>
              ) : (
                <button onClick={() => joinRoom(room)}>
                  joinnnnnnnnnnnnnnn
                </button>
              )}
            </div>
          )
        })}
      {showNewRoom ? (
        <form onSubmit={addNewRoom}>
          <input type="text" name="name" required onChange={changeHandler} />
          <fieldset>
            <input
              type="radio"
              name="room_type"
              value="classic"
              onChange={changeHandler}
              defaultChecked
              required
            />
            <input
              type="radio"
              name="room_type"
              value="stream"
              onChange={changeHandler}
            />
            <input
              type="radio"
              name="room_type"
              value="gather"
              onChange={changeHandler}
            />
          </fieldset>
          <button type="button" onClick={toggleShowNewRoom}>
            cancel
          </button>
          <button type="submit">Create</button>
        </form>
      ) : (
        <button id="add_room" onClick={toggleShowNewRoom}>
          add room
        </button>
      )}
    </>
  )
}

export default Game
