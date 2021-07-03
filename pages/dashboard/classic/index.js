import { useEffect, useRef, useState } from 'react'
import { useVideo } from '../../../contexts/video'

const Classic = () => {
  const [userName, setUserName] = useState('')
  const [roomId, setRoomId] = useState('')

  const { connectWithMyPeer, getLocalStream, localStream, socketID } =
    useVideo()

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
    if (socketID) {
      if (userName && roomId) {
        connectWithMyPeer({ userName, roomId })
      }
    }
  }, [socketID])

  useEffect(() => {
    if (localStream) {
      localVidRef.current.srcObject = localStream
    }
  }, [localStream])

  const startStreams = () => {
    getLocalStream()
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

export default Classic
