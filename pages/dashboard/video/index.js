import { useEffect, useState } from 'react'
import { useComms } from '../../../contexts/comms'
import { useVideo } from '../../../contexts/video'
import { useAuth } from '../../../contexts/auth'

const Video = (props) => {
  const [socketData, setSocketData] = useState({})

  const { selectedcomm } = useComms()
  const { registerNewUser, socketID, createEmptyRoom, callRooms } = useVideo()
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
      registerNewUser(data)
    }
  }, [socketID])

  const joinRoom = () => {
    let urls = {
      development: 'http://localhost:3000/',
      production: 'https://project-blarg-next.vercel.app/',
    }

    window.open(
      `${
        urls[process.env.NODE_ENV]
      }?gather_window=true&room_type=classic&harthid=${socketData.harthid}`,
    )
  }

  const createRoom = () => {
    createEmptyRoom(socketData)
  }

  if (socketID) {
    return (
      <ul>
        {(callRooms || []).map((room) => (
          <li>
            {room.harthName}
            <button onClick={joinRoom}>join</button>
          </li>
        ))}
        <button onClick={createRoom}>create room</button>
      </ul>
    )
  }

  return <p>loading...</p>
}

export default Video
