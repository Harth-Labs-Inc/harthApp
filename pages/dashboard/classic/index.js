import { useEffect, useRef, useState } from 'react'
import { useVideo } from '../../../contexts/video'

const Classic = () => {
  const [userName, setUserName] = useState('')
  const [roomId, setRoomId] = useState('')

  const {
    connectWithMyPeer,
    getLocalStream,
    localStream,
    socketID,
    groupCallStreams,
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
    if (socketID) {
      if (userName && roomId) {
        connectWithMyPeer({ userName, roomId })
      }
    }
  }, [socketID])

  useEffect(() => {
    console.log('test')
    if (localStream) {
      localVidRef.current.srcObject = localStream
    }
  }, [localStream])

  const startStreams = () => {
    getLocalStream()
  }

  const GroupCallVideo = ({ stream, idx }) => {
    const videoRef = useRef()
    console.log(stream)
    useEffect(() => {
      const remoteGroupCallVideo = videoRef.current
      remoteGroupCallVideo.srcObject = stream
      remoteGroupCallVideo.onloadedmetadata = () => {
        remoteGroupCallVideo.play()
      }
    }, [stream])

    return (
      <div>
        <video ref={videoRef} autoPlay />
      </div>
    )
  }

  return (
    <main>
      <section id="stream-window">
        <video ref={localVidRef} id="localVideo" autoPlay playsInline />
        {groupCallStreams &&
          groupCallStreams.length > 0 &&
          groupCallStreams.map((stream, idx) => {
            return <GroupCallVideo stream={stream} key={idx} />
          })}
      </section>
      <button onClick={startStreams}>stream</button>
    </main>
  )
}

export default Classic
