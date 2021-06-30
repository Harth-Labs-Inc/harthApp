import { useEffect, useRef } from 'react'
import { useVideo } from '../../../contexts/video'

const Classic = () => {
  const { getLocalStream, createPeerConnection, localStream } = useVideo()

  const localVidRef = useRef()

  useEffect(() => {
    if (localStream) {
      createPeerConnection()
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
