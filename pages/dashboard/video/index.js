import { useEffect, useState } from 'react'
import { useComms } from '../../../contexts/comms'
import { useVideo } from '../../../contexts/video'
import { useAuth } from '../../../contexts/auth'

const Video = (props) => {
  const [socketData, setSocketData] = useState({})
  const [newRoomToggled, setNewRoomToggled] = useState(false)
  const [newRoom, setNewRoom] = useState({ room_type: 'classic' })

  const { selectedcomm } = useComms()
  const { getInitialCallRooms, socketID, createEmptyRoom, callRooms } =
    useVideo()
  const { user } = useAuth()

  useEffect(() => {
    if (socketID) {
      let creator = selectedcomm.users.find((usr) => usr.userId === user._id)
      let data = {}
      data.icon = creator.iconKey
      data.name = creator.name
      data.harthid = selectedcomm._id
      data.socketId = socketID
      data.harthName = 'test'
      setSocketData(data)
      getInitialCallRooms(data)
    }
  }, [socketID, selectedcomm])

  const joinRoom = ({ roomId, roomType }) => {
    let urls = {
      development: 'http://localhost:3000/',
      production: 'https://project-blarg-video-socket.herokuapp.com/',
    }
    window.open(
      `${
        urls[process.env.NODE_ENV]
      }?gather_window=true&room_type=${roomType}&user_name=${
        socketData.name
      }&user_img=${socketData.icon}&room_id=${roomId}&harth_id=${
        selectedcomm._id
      }`,
    )
  }
  const createRoom = (e) => {
    e.preventDefault()
    createEmptyRoom({ ...socketData, ...newRoom })
    resetNewRoom()
  }
  const triggerNewRoom = () => {
    setNewRoomToggled(!newRoomToggled)
  }
  const inputHandler = (e) => {
    let { value, name } = e.target
    setNewRoom({ ...newRoom, [name]: value })
  }
  const resetNewRoom = () => {
    setNewRoom({ room_type: 'classic' })
    triggerNewRoom()
  }

  if (socketID) {
    return (
      <ul>
        {(callRooms || []).map((room, idx) => (
          <li key={idx} className="room-container">
            {room.roomName}
            {room.peers &&
              room.peers.map(({ img, name }) => {
                if (img) {
                  return (
                    <img
                      style={{
                        height: '40px',
                        width: '40px',
                        borderRadius: '50%',
                      }}
                      src={img}
                    ></img>
                  )
                } else if (name) {
                  return (
                    <p
                      style={{
                        height: '40px',
                        width: '40px',
                        borderRadius: '50%',
                        background: 'lightslategrey',
                        color: 'white',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                      }}
                    >
                      {name}
                    </p>
                  )
                }
              })}
            <button onClick={() => joinRoom(room)}>join</button>
          </li>
        ))}
        {newRoomToggled ? (
          <div className="room-container">
            <form onSubmit={createRoom}>
              <input
                name="roomName"
                placeholder="Room Name"
                onChange={inputHandler}
                required
              />
              <div style={{ display: 'flex' }}>
                <input
                  type="radio"
                  name="room_type"
                  value="Voice"
                  onChange={inputHandler}
                  defaultChecked
                  required
                />
                Voice
                <input
                  type="radio"
                  name="room_type"
                  value="stream"
                  onChange={inputHandler}
                />
                Stream
                <input
                  type="radio"
                  name="room_type"
                  value="classic"
                  onChange={inputHandler}
                  defaultChecked
                />
                Classic
              </div>
              <div className="flex-container">
                <button onClick={resetNewRoom} type="button">
                  X
                </button>
                <button type="submit">Create</button>
              </div>
            </form>
          </div>
        ) : (
          <div onClick={triggerNewRoom} className="room-container">
            <button>+</button>
          </div>
        )}
      </ul>
    )
  }

  return <p>loading...</p>
}

export default Video
