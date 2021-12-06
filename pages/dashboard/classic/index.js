import { useEffect, useRef, useState } from 'react'
import { useVideo } from '../../../contexts/video'

let userName = ''
let userIcon = ''
let roomId = ''
const Classic = () => {
  const {
    socket,
    connectWithMyPeer,
    getLocalStream,
    getScreenCapture,
    captureStream,
    localStream,
    socketID,
    groupCallStreams,
    leaveGroupCall,
  } = useVideo()

  const localVidRef = useRef()
  const captureVidRef = useRef()
  const remoteVidRef = useRef()

  const beforeUnload = (e) => {
    e.preventDefault()
    e.returnValue = ''
    console.log('socket', socket)
    leaveGroupCall({ roomId, userName, socketID })
  }

  useEffect(() => {
    // window.addEventListener('beforeunload', beforeUnload)

    const queryString = window.location.search
    const urlParams = new URLSearchParams(queryString)
    const USRNM = urlParams.get('user_name')
    const USRIMG = urlParams.get('user_img')
    const ROOMID = urlParams.get('room_id')
    if (USRIMG) {
      userIcon = USRIMG
    }
    if (USRNM) {
      userName = USRNM
    }
    if (ROOMID) {
      roomId = ROOMID
    }

    // return () => {
    //   window.removeEventListener('beforeunload', beforeUnload)
    // }
  }, [])

  useEffect(() => {
    if (socketID) {
      if (userName && roomId) {
        connectWithMyPeer({ userName, userIcon, roomId })
      }
    }
  }, [socketID])

  useEffect(() => {
    if (localStream) {
      localVidRef.current.srcObject = localStream
    }
  }, [localStream])

  useEffect(() => {
    if (captureStream) {
      captureVidRef.current.srcObject = captureStream
    }
  }, [captureStream])

  useEffect(() => {
    console.log(groupCallStreams)
  }, [groupCallStreams])

  const startVideo = () => {
    getLocalStream()
  }
  const startCapture = () => {
    getScreenCapture()
  }

  const leaveRoom = async () => {
    let finished = await leaveGroupCall({ roomId, userName, socketID })
    console.log(window, 'asdfasdf')
    window.close()
  }
  const toggleMedia = () => {
    if (!localStream || localStream.active === false) {
      startVideo()
    } else {
      stopVideoOnly(localStream)
    }
  }
  const toggleAudio = () => {
    if (localStream) {
      stopAudioOnly(localStream)
    }
  }
  const toggleCapture = () => {
    console.log(captureStream)
    if (!captureStream || captureStream.active === false) {
      startCapture()
    } else {
      stopCapture(captureStream)
    }
  }

  //stop screen share
  const stopCapture = () => {
    let tracks = captureVidRef.current.srcObject.getTracks()

    tracks.forEach((track) => track.stop())
    captureVidRef.current.srcObject = null
  }

  // stop both mic and camera
  const stopBothVideoAndAudio = (stream) => {
    stream.getTracks().forEach((track) => {
      if (track.readyState == 'live') {
        track.stop()
      }
    })
  }

  // stop only camera
  const stopVideoOnly = (stream) => {
    try {
      stream.getTracks().forEach((track) => {
        if (track.readyState == 'live' && track.kind === 'video') {
          track.stop()
        }
      })
    } catch (error) {}
  }

  // stop only mic
  const stopAudioOnly = (stream) => {
    stream.getTracks().forEach((track) => {
      console.log(track)
      if (track.readyState == 'live' && track.kind === 'audio') {
        track.stop()
      }
    })
  }

  console.log('active streamss....', groupCallStreams)

  const GroupCallVideo = ({ stream, idx }) => {
    const videoRef = useRef()
    useEffect(() => {
      const remoteGroupCallVideo = videoRef.current
      remoteGroupCallVideo.srcObject = stream
      console.log(remoteGroupCallVideo)
      remoteGroupCallVideo.onloadedmetadata = () => {
        remoteGroupCallVideo.play()
      }
    }, [videoRef])

    return (
      <div>
        <video
          ref={videoRef}
          autoPlay
          autoPlay
          playsInline
          style={{ height: '40px', width: '40px', objectFit: 'contain' }}
        />
      </div>
    )
  }

  return (
    <main>
      <section id="stream-window">
        <video ref={localVidRef} id="localVideo" autoPlay playsInline />
        <video
          ref={captureVidRef}
          id="captureVideo"
          autoPlay
          playsInline
          style={{ height: '500px', width: '500px', objectFit: 'contain' }}
        />
        <video
          ref={remoteVidRef}
          id="remoteVideo"
          autoPlay
          playsInline
          style={{ height: '40px', width: '40px', objectFit: 'contain' }}
        />
        {/* {groupCallStreams &&
          groupCallStreams.length &&
          groupCallStreams.map((stream, idx) => {
            return <GroupCallVideo stream={stream} key={idx} />
          })} */}
      </section>
      <ul>
        <li onClick={toggleCapture}>stream</li>
        <li onClick={leaveRoom}>Leave</li>
        <li onClick={toggleAudio}>mute</li>
        <li onClick={toggleMedia}>media</li>
      </ul>
    </main>
  )
}

export default Classic
