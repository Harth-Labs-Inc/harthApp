import { useEffect, useRef, useState } from 'react'
import socketClient from 'socket.io-client'

let myPeer
const Stream = () => {
  const [userName, setUserName] = useState('')
  const [userIcon, setUserIcon] = useState('')
  const [roomId, setRoomId] = useState('')
  const [harthId, setHarthId] = useState('')
  const [socket, setSocket] = useState(null)
  const [socketID, setSocketID] = useState(null)
  const [callRooms, setCallRooms] = useState([])
  const [groupCallStreams, setGroupCallStreams] = useState({})
  const [localStream, setLocalStream] = useState()
  const [captureStream, setCaptureStream] = useState()
  const [myPeerId, setMyPeerId] = useState(null)

  const localVidRef = useRef()
  const captureVidRef = useRef()
  const groupStreamsRef = useRef([])

  useEffect(() => {
    let urls = {
      development: 'http://localhost:5000',
      production: 'https://project-blarg-video-socket.herokuapp.com',
    }
    setSocket(socketClient(urls[process.env.NODE_ENV]))

    const queryString = window.location.search
    const urlParams = new URLSearchParams(queryString)
    const USRNM = urlParams.get('user_name')
    const USRIMG = urlParams.get('user_img')
    const ROOMID = urlParams.get('room_id')
    const HARTHID = urlParams.get('harth_id')
    if (USRIMG) {
      setUserIcon(USRIMG)
    }
    if (USRNM) {
      setUserName(USRNM)
    }
    if (ROOMID) {
      setRoomId(ROOMID)
    }
    if (HARTHID) {
      setHarthId(HARTHID)
    }
    startAudio()
  }, [])

  // ------- socket connection and listeners ------------

  useEffect(() => {
    if (socket) {
      socket.on('connection', () => {
        setSocketID(socket.id)
      })
      socket.on('broadcast', (data) => {
        let { event, groupCallRooms, peers } = data
        switch (event) {
          case 'GROUP_CALL_ROOMS':
            setCallRooms(groupCallRooms)
            break
          case 'GROUP_CALL_PEERS':
            console.log('peers', peers)
            break
          default:
            break
        }
      })

      socket.on('group-call-join-request', (data) => {
        console.log('another user has joined', data)
        connectToNewUser(data)
      })
      socket.on('group-call-user-left', (data) => {
        console.log('user stream to be removed', data)
      })
    }
    if (socketID) {
      if (userName && roomId) {
        connectWithMyPeer({ userName, userIcon, roomId })
      }
    }
  }, [socket, socketID])

  // ----------- media --------------

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
    if (Object.keys(groupCallStreams).length) {
      Object.values(groupCallStreams).forEach((stream, idx) => {
        const remoteGroupCallVideo = groupStreamsRef.current[idx]
        remoteGroupCallVideo.srcObject = stream
        console.log(remoteGroupCallVideo)
        remoteGroupCallVideo.onloadedmetadata = () => {
          remoteGroupCallVideo.play()
        }
      })
    }
  }, [groupCallStreams])

  const startVideo = () => {
    getLocalStream('video')
  }
  const stopVideoOnly = (stream) => {
    try {
      stream.getTracks().forEach((track) => {
        if (track.readyState == 'live' && track.kind === 'video') {
          let enabled = track.enabled
          console.log('video is: ', !enabled)
          track.enabled = !enabled
        }
      })
    } catch (error) {}
  }
  const startAudio = () => {
    getLocalStream('audio')
  }
  const stopAudioOnly = (stream) => {
    try {
      stream.getTracks().forEach((track) => {
        if (track.readyState == 'live' && track.kind === 'audio') {
          let enabled = track.enabled
          console.log('audio is: ', !enabled)
          track.enabled = !enabled
        }
      })
    } catch (error) {}
  }
  const startCapture = () => {
    getScreenCapture()
  }
  const stopCapture = () => {
    let tracks = captureVidRef.current.srcObject.getTracks()

    tracks.forEach((track) => track.stop())
    captureVidRef.current.srcObject = null
  }
  const toggleMedia = () => {
    if (!localStream || localStream.active === false) {
      startVideo()
    } else {
      stopVideoOnly(localStream)
    }
  }
  const toggleAudio = () => {
    if (!localStream || localStream.active === false) {
      startAudio()
    } else {
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
  const getLocalStream = async (startWith) => {
    let stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    })

    if (startWith && startWith == 'video') {
      try {
        stream.getTracks().forEach((track) => {
          if (track.kind === 'audio') {
            track.enabled = false
          }
        })
      } catch (error) {}
    }
    if (startWith && startWith == 'audio') {
      try {
        stream.getTracks().forEach((track) => {
          if (track.kind === 'video') {
            track.enabled = false
          }
        })
      } catch (error) {}
    }

    setLocalStream(stream)
  }
  const getScreenCapture = async () => {
    try {
      let capture = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always',
        },
        audio: false,
      })

      if (capture) {
        setCaptureStream(capture)
      }
    } catch (err) {
      console.error('Error: ' + err)
    }
  }
  const addVideoStream = (incomingStream, peerid) => {
    console.log(groupCallStreams, peerid)
    let groupstreams = { ...groupCallStreams, [peerid]: incomingStream }
    setGroupCallStreams(groupstreams)
  }

  // ------------ rooms -----------------

  const getRoomPeers = () => {
    socket && socket.emit('get-room-peers', roomId)
  }
  const leaveRoom = async () => {
    let finished = await leaveGroupCall({ roomId, userName, socketID })
    window.close()
  }
  const connectWithMyPeer = (data) => {
    let pID = ''
    myPeer = new window.Peer(undefined, {
      path: '/peerjs',
      host: '/',
      port: '5000',
    })

    myPeer.on('open', (peerid) => {
      setMyPeerId(peerid)
      console.log('my peer id is: ', peerid)
      pID = peerid
      joinGroupCall(peerid, data)
    })

    myPeer.on('call', async (call) => {
      if (localStream) {
        call.answer(localStream)
      }

      call.on('stream', (incomingStream) => {
        if (incomingStream) {
          addVideoStream(incomingStream, call.peer)
        }
      })
    })
  }
  const joinGroupCall = (peerid, data) => {
    let { roomId, userIcon, userName } = data
    userWantsToJoinGroupCall({
      userName,
      userIcon,
      peerId: peerid,
      socketID,
      roomId,
      localStreamId: (localStream || {}).id || '',
      harthId,
    })
  }
  const userWantsToJoinGroupCall = (data) => {
    socket && socket.emit('group-call-join-request', data)
  }
  const connectToNewUser = async (data) => {
    if (myPeer) {
      const call = myPeer.call(data.peerId, localStream)
      call &&
        call.on('stream', (incomingStream) => {
          if (incomingStream) {
            addVideoStream(incomingStream, data.peerId)
          }
        })
    }
  }
  const leaveGroupCall = (data) => {
    return new Promise((res, rej) => {
      socket &&
        socket.emit('group-call-user-left', data, (response) => {
          if (response.ok) {
            res(true)
          }

          if (myPeer) {
            myPeer.destroy()
          }
        })
    })
  }

  return (
    <main style={{ display: 'flex' }}>
      <ul>
        <li onClick={toggleCapture}>stream</li>
        <li onClick={leaveRoom}>Leave</li>
        <li onClick={toggleAudio}>mute</li>
        <li onClick={toggleMedia}>media</li>
      </ul>
      <section
        style={{ display: 'flex', flexDirection: 'column' }}
        id="stream-window"
      >
        <video
          ref={localVidRef}
          id="localVideo"
          autoPlay
          playsInline
          style={{ height: '100px', width: '100px', objectFit: 'contain' }}
        />
        <video
          ref={captureVidRef}
          id="captureVideo"
          autoPlay
          playsInline
          style={{ height: '500px', width: '500px', objectFit: 'contain' }}
        />
        {groupCallStreams &&
          Object.values(groupCallStreams) &&
          Object.values(groupCallStreams).length &&
          Object.values(groupCallStreams).map((stream, idx) => {
            return (
              <video
                key={idx}
                ref={(el) => (groupStreamsRef.current[idx] = el)}
                id="remoteVideo"
                autoPlay
                playsInline
                style={{
                  height: '500px',
                  width: '500px',
                  objectFit: 'contain',
                }}
              />
            )
          })}
      </section>
    </main>
  )
}

export default Stream
