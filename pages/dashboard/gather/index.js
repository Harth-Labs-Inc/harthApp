import { useEffect, useRef, useState } from 'react'
import { useVideo } from '../../../contexts/video'

const Gather = () => {
  const [userName, setUserName] = useState('')
  const [roomId, setRoomId] = useState('')

  const {
    connectWithMyPeer,
    getLocalStream,
    createPeerConnection,
    localStream,
  } = useVideo()

  const localVidRef = useRef()

  useEffect(() => {
    const queryString = window.location.search
    const urlParams = new URLSearchParams(queryString)
    const USRNM = urlParams.get('user_name')
    const ROOMID = urlParams.get('room_id')
    if (USRNM) {
      setUserName(USRNM)
    }
    if (ROOMID) {
      setRoomId(ROOMID)
    }
  }, [])

  useEffect(() => {
    if (localStream) {
      createPeerConnection()
      localVidRef.current.srcObject = localStream
    }
  }, [localStream])

  const startStreams = () => {
    getLocalStream()
    connectWithMyPeer({ userName, roomId })
  }

  return (
    <main>
      <section id="stream-window">
        <video ref={localVidRef} id="localVideo" autoPlay playsInline />
      </section>
      <button onClick={startStreams}>stream</button>
    </main>
  )
}

export default Gather
