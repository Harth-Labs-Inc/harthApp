import { useEffect, useState } from 'react'
import { useComms } from '../../../contexts/comms'
import { useVideo } from '../../../contexts/video'
import { useAuth } from '../../../contexts/auth'

import Modal from '../../../components/Modal'
import { CloseBtn } from '../../../components/Common/Button'

import GatherForm from './GatherForm'
import { CreateGatheringFormProvider } from './GatherForm/GatheringFormContext'

const Video = (props) => {
  const [socketData, setSocketData] = useState({})
  const [newRoomToggled, setNewRoomToggled] = useState(false)
  const [newRoom, setNewRoom] = useState({ room_type: 'classic' })
  const [modal, setModal] = useState(false)

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

  const joinRoom = (data) => {
    let urls = {
      development: 'http://localhost:3000/',
      production: 'https://project-blarg-next.vercel.app/',
    }
    window.open(
      `${urls[process.env.NODE_ENV]}?gather_window=true&room_type=${
        data.gatheringType
      }&user_name=${socketData.name}&user_img=${socketData.icon}&room_id=${
        data.roomId
      }&harth_id=${selectedcomm._id}`,
    )
  }
  const createRoom = (room) => {
    createEmptyRoom({ ...socketData, ...room }, (data) => {
      joinRoom({ ...data.newGroupCallRoom, ...room })
    })
    resetNewRoom()
  }
  const triggerNewRoom = () => {
    setNewRoomToggled((prevRoomToggle) => !prevRoomToggle)
  }
  const inputHandler = (e) => {
    let { value, name } = e.target
    setNewRoom({ ...newRoom, [name]: value })
  }
  const resetNewRoom = () => {
    setNewRoom({ room_type: 'classic' })
    triggerNewRoom()
  }

  const showModal = () => {
    setModal(!modal)
  }

  const createRoomFormSubmit = (room) => {
    createRoom(room)
  }

  if (socketID) {
    return (
      <section id="gatherings">
        {newRoomToggled && (
          <Modal id="create_gathering" show={modal} onToggleModal={showModal}>
            <CloseBtn onClick={triggerNewRoom} />
            <CreateGatheringFormProvider>
              <GatherForm createRoomFormSubmit={createRoomFormSubmit} />
            </CreateGatheringFormProvider>
          </Modal>
        )}
        <div className="room-container">
          <button id="gathering_create" onClick={triggerNewRoom}>
            + gathering
          </button>
        </div>
        <p>Now</p>
        <ul id="current_rooms">
          {(callRooms || []).map((room, idx) => (
            <li key={idx} className={`${room.gatheringType} room-container`}>
              <div className="room-type">{room.gatheringType}</div>
              <p className="room-title">{room.roomName}</p>
              <ul className="room-peer-list">
                {room.peers &&
                  room.peers.map(({ img, name }) => {
                    if (img) {
                      return (
                        <li key={name} className="room-peer">
                          <img
                            style={{
                              height: '40px',
                              width: '40px',
                              borderRadius: '50%',
                            }}
                            src={img}
                          ></img>
                        </li>
                      )
                    } else if (name) {
                      return (
                        <li key={name} className="room-peer">
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
                        </li>
                      )
                    }
                  })}
              </ul>
              <button className="room-join" onClick={() => joinRoom(room)}>
                Join
              </button>
            </li>
          ))}
        </ul>
      </section>
    )
  }

  return <p>loading...</p>
}

export default Video
