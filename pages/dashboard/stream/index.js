import { useEffect, useRef, useState } from 'react'
import io from 'socket.io-client'
import { getTurnServers } from '../../../util/TURN'

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
  const [Peers, setPeers] = useState([])

  const mainRef = useRef()
  const localVidRef = useRef()
  const captureVidRef = useRef()
  const groupStreamsRef = useRef([])

  useEffect(() => {
    let urls = {
      development: 'http://localhost:5000',
      production: 'https://project-blarg-video-socket.herokuapp.com',
    }
    setSocket(
      io.connect(urls[process.env.NODE_ENV], {
        transports: ['websocket'],
      }),
    )

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
            setPeers(peers)
            break
          default:
            break
        }
      })
      socket.on('group-call-user-left', (data) => {})
    }
    if (socketID && localStream) {
      if (userName && roomId) {
        connectWithMyPeer({ userName, userIcon, roomId })
      }
    }
  }, [socket, socketID, localStream])

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
    if (Object.keys(groupCallStreams).length) {
      Object.values(groupCallStreams).forEach((stream, idx) => {
        const remoteGroupCallVideo = groupStreamsRef.current[idx]
        if (remoteGroupCallVideo) {
          remoteGroupCallVideo.srcObject = stream
          remoteGroupCallVideo.onloadedmetadata = () => {
            remoteGroupCallVideo.play()
          }
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

    try {
      stream.getTracks().forEach((track) => {
        if (track.kind === 'audio') {
          track.enabled = false
        }
      })
    } catch (error) {}
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
    } catch (err) {}
  }
  const addVideoStream = (incomingStream, peerid) => {
    setGroupCallStreams((prevStreams) => {
      return { ...prevStreams, [peerid]: incomingStream }
    })
  }
  const addCaptureStream = () => {
    console.log('made it')
  }

  // ------------ rooms -----------------

  const getRoomPeers = () => {
    socket && socket.emit('get-room-peers', roomId)
  }
  const leaveRoom = async () => {
    let finished = await leaveGroupCall({ roomId, userName, socketID })
    console.log(finished)
    window.close()
  }
  const connectWithMyPeer = (data) => {
    let pID = ''
    myPeer = new window.Peer(undefined, {
      config: {
        iceServers: [
          ...getTurnServers(),
          {
            url: 'stun:stun.1und1.de:3478',
          },
        ],
      },
    })

    myPeer.on('open', (peerid) => {
      setMyPeerId(peerid)
      pID = peerid
      joinGroupCall(peerid, data)
    })

    myPeer.on('error', function (err) {
      console.log(err)
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
    socket &&
      socket.emit('group-call-join-request', data, ({ peers }) => {
        connectToUsers(peers)
      })
  }
  const connectToUsers = async (peers) => {
    if (myPeer) {
      peers.forEach((peer) => {
        if (peer.peerId !== myPeer.id) {
          const call = myPeer.call(peer.peerId, localStream)
          call &&
            call.on('stream', (incomingStream) => {
              if (incomingStream) {
                addVideoStream(incomingStream, peer.peerId)
              }
            })
        }
      })
    }
  }

  const shareCaptureScreen = async () => {
    if (myPeer) {
      Peers.forEach((peer) => {
        if (peer.peerId !== myPeer.id) {
          const call = myPeer.call(peer.peerId, captureStream)
          call &&
            call.on('stream', (incomingStream) => {
              if (incomingStream) {
                addCaptureStream(incomingStream, peer.peerId)
              }
            })
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

  console.log(callRooms, Peers, groupCallStreams)

  return (
    <main id="stream-window" ref={mainRef}>
      <div>{callRooms[0] ? `${callRooms[0].roomName}` : null}</div>
      <ul role="nav" id="stream-window-controls">
        <li onClick={toggleCapture}>
          <button>stream</button>
        </li>
        <li onClick={leaveRoom}>
          <button>leave</button>
        </li>
        <li onClick={toggleAudio}>
          <button>mute</button>
        </li>
        <li onClick={toggleMedia}>
          <button>media</button>
        </li>
      </ul>
      <section id="stream-window-grid">
        <video
          ref={localVidRef}
          id="localVideo"
          autoPlay
          playsInline
          muted={true}
          style={{ height: '108px', width: '100px', objectFit: 'contain' }}
        />
        {/* <video
          ref={captureVidRef}
          id="screenShare"
          autoPlay
          playsInline
          style={{ height: '100px', width: '100px', objectFit: 'contain' }}
        /> */}
        <section id="stream-window-peer-container">
          {(Peers || [])
            .filter((peer) => peer.peerId !== myPeerId)
            .map((peer, idx) => {
              if (groupCallStreams[peer.peerId]) {
                return (
                  <video
                    key={idx}
                    ref={(el) => (groupStreamsRef.current[idx] = el)}
                    id={`remoteVideo-${idx}`}
                    autoPlay
                    playsInline
                  />
                )
              }
              return (
                <div key={idx} id={`peerBox-${peer.name}`}>
                  <img src={peer.img} alt={`${peer.name} profile pic`} />
                  <p>{peer.name}</p>
                </div>
              )
            })}
          {/* {groupCallStreams &&
            Object.values(groupCallStreams) &&
            Object.values(groupCallStreams).length &&
            Object.values(groupCallStreams).map((stream, idx) => {
              return (
                <video
                  key={idx}
                  ref={(el) => (groupStreamsRef.current[idx] = el)}
                  id={`remoteVideo-${idx}`}
                  autoPlay
                  playsInline
                />
              )
            })} */}
        </section>
      </section>
    </main>
  )
}

export default Stream
