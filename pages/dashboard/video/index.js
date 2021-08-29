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
      data.name = creator.name
      data.harthid = selectedcomm._id
      data.socketId = socketID
      data.harthName = 'test'
      setSocketData(data)
      getInitialCallRooms()
    }
  }, [socketID])

  const joinRoom = ({ roomId, roomType }) => {
    let urls = {
      development: 'http://localhost:3000/',
      production: 'https://project-blarg-next.vercel.app/',
    }
    window.open(
      `${
        urls[process.env.NODE_ENV]
      }?gather_window=true&room_type=${roomType}&user_name=${
        socketData.name
      }&room_id=${roomId}`,
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
    console.log(name, value)
    setNewRoom({ ...newRoom, [name]: value })
  }

  const resetNewRoom = () => {
    setNewRoom({})
    triggerNewRoom()
  }

  console.log(callRooms)

  if (socketID) {
    return (
      <ul>
        {(callRooms || []).map((room, idx) => (
          <li key={idx} className="room-container">
            {room.roomName}
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
                  value="Stream"
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
        {/* <button onClick={createRoom}>create rooms</button> */}
      </ul>
    )
  }

  return <p>loading...</p>
}

export default Video

// import { useEffect, useState } from 'react'
// import { useComms } from '../../../contexts/comms'
// import { useVideo } from '../../../contexts/video'
// import { useAuth } from '../../../contexts/auth'

// const Video = (props) => {
//   const [socketData, setSocketData] = useState({})

//   const { selectedcomm } = useComms()
//   const { getInitialCallRooms, socketID, createEmptyRoom, callRooms } =
//     useVideo()
//   const { user } = useAuth()

//   useEffect(() => {
//     if (socketID) {
//       let creator = selectedcomm.users.find((usr) => usr.userId === user._id)
//       let data = {}
//       data.name = creator.name
//       data.harthid = selectedcomm._id
//       data.socketId = socketID
//       data.harthName = 'test'
//       setSocketData(data)
//       getInitialCallRooms()
//     }
//   }, [socketID])

//   const joinRoom = ({ roomId }) => {
//     let urls = {
//       development: 'http://localhost:3000/',
//       production: 'https://project-blarg-next.vercel.app/',
//     }

//     window.open(
//       `${
//         urls[process.env.NODE_ENV]
//       }?gather_window=true&room_type=classic&user_name=${
//         socketData.name
//       }&room_id=${roomId}`,
//     )
//   }

//   const createRoom = () => {
//     createEmptyRoom(socketData)
//   }

//   const NewRoomContainer = () => {
//     if (newRoomToggled) {
//       return (
//         <div>
//           <form></form>
//         </div>
//       )
//     }
//     return (
//       <div>
//         <button>+</button>
//       </div>
//     )
//   }

//   if (socketID) {
//     return (
//       <ul>
//         {(callRooms || []).map((room, idx) => (
//           <li key={idx}>
//             {room.harthName}
//             <button title={room.roomId} onClick={() => joinRoom(room)}>
//               join
//             </button>
//           </li>
//         ))}
//         <NewRoomContainer />
//         <button></button>
//         <button onClick={createRoom}>create rooms</button>
//       </ul>
//     )
//   }

//   return <p>loading...</p>
// }

// export default Video
