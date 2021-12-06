import { set } from 'js-cookie'
import { useEffect, useRef, useState } from 'react'
import io from 'socket.io-client'
import { getTurnServers } from '../../../util/TURN'

let myPeer
const Voice = () => {
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
  const [Peers, setPeers] = useState([])
  const [isMute, setIsMute] = useState(true)
  const [videoOn, setVideoOn] = useState(false)

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
      socket.on('user-left', (data) => {
        console.log('user left...', data)
        console.log(Peers, groupCallStreams)
        window.close()
      })
    }
    if (socketID && localStream && !myPeer) {
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
        console.log(track)
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
  const toggleVideo = () => {
    if (!localStream) {
      setVideoOn(true)
      startVideo()
    } else {
      try {
        localStream.getTracks().forEach((track) => {
          if (track.kind === 'video') {
            let enabled = track.enabled
            if (!enabled) {
              setVideoOn(true)
              stopVideoOnly(localStream)
            } else {
              setVideoOn(false)
              stopVideoOnly(localStream)
            }
          }
        })
      } catch (error) {}
    }
  }
  const toggleAudio = () => {
    if (!localStream) {
      startAudio()
    } else {
      try {
        localStream.getTracks().forEach((track) => {
          if (track.kind === 'audio') {
            let enabled = track.enabled
            if (!enabled) {
              setIsMute(true)
              stopAudioOnly(localStream)
            } else {
              setIsMute(false)
              stopAudioOnly(localStream)
            }
          }
        })
      } catch (error) {}
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
  const toggleOptions = () => {
    return null
  }
  const toggleChat = () => {
    return null
  }

  // ------------ rooms -----------------

  const leaveRoom = () => {
    leaveGroupCall({ roomId, userName, socketID }, () => {
      console.log(finished)
      window.close()
    })
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
      console.log('my peer id is ', peerid)
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

  return (
    <main id="voice-window" ref={mainRef}>
      <article id="room-occupants">
        <div>{callRooms[0] ? `${callRooms[0].roomName}` : null}</div>
        <ul>
          {myPeer &&
            (Peers || [])
              .filter((peer) => peer.peerId !== myPeer._id)
              .map((peer, idx) => {
                ;<li key={idx} id={`peerBox-${peer.name}`}>
                  <img src={peer.img} alt={`${peer.name} profile pic`} />
                  <p>{peer.name}</p>
                </li>
                //   if (groupCallStreams[peer.peerId]) {
                //   return (
                //     <video
                //       key={idx}
                //       ref={(el) => (groupStreamsRef.current[idx] = el)}
                //       id={`remoteVideo-${idx}`}
                //       autoPlay
                //       playsInline
                //     />
                //   )
                // }
              })}
        </ul>
      </article>
    </main>
    // <main id="stream-window" ref={mainRef}>
    //   <div>{callRooms[0] ? `${callRooms[0].roomName}` : null}</div>
    //   <ul role="nav" id="stream-window-controls">
    //     <div className="list-left">
    //       <li onClick={leaveRoom}>
    //         <button id="leave_room">leave</button>
    //       </li>
    //     </div>
    //     <div className="list-center">
    //       <li onClick={toggleAudio}>
    //         <button id={isMute ? 'muted' : 'unmuted'}>mute</button>
    //       </li>
    //       <li onClick={toggleVideo}>
    //         <button id={videoOn ? 'stream' : 'no_stream'}>stream</button>
    //       </li>
    //       <li onClick={toggleOptions}>
    //         <button id="options">options</button>
    //       </li>
    //       <li onClick={toggleCapture}>
    //         <button id="screen_share">share screen</button>
    //       </li>
    //       <li onClick={toggleChat}>
    //         <button id="chat">chat</button>
    //       </li>
    //     </div>
    //   </ul>
    //   <section id="stream-window-grid">
    //     <video
    //       ref={localVidRef}
    //       id="localVideo"
    //       autoPlay
    //       playsInline
    //       muted={true}
    //     />

    //     {/* <video
    //       ref={captureVidRef}
    //       id="screenShare"
    //       autoPlay
    //       playsInline
    //       style={{ height: '100px', width: '100px', objectFit: 'contain' }}
    //     /> */}
    //     <section id="stream-window-peer-container">
    //       {myPeer &&
    //         (Peers || [])
    //           .filter((peer) => peer.peerId !== myPeer._id)
    //           .map((peer, idx) => {
    //             if (groupCallStreams[peer.peerId]) {
    //               return (
    //                 <video
    //                   key={idx}
    //                   ref={(el) => (groupStreamsRef.current[idx] = el)}
    //                   id={`remoteVideo-${idx}`}
    //                   autoPlay
    //                   playsInline
    //                 />
    //               )
    //             }
    //             return (
    //               <div key={idx} id={`peerBox-${peer.name}`}>
    //                 <img src={peer.img} alt={`${peer.name} profile pic`} />
    //                 <p>{peer.name}</p>
    //               </div>
    //             )
    //           })}
    //     </section>
    //   </section>
    // </main>
  )
}

export default Voice
