import { resolveHref } from 'next/dist/next-server/lib/router/router'
import { createContext, useState, useContext, useEffect } from 'react'
import io from 'socket.io-client'

const VideoContext = createContext({})

let myPeer
export const VideoProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const [socketID, setSocketID] = useState(null)
  const [callRooms, setCallRooms] = useState([])
  const [groupCallStreams, setGroupCallStreams] = useState({})
  const [localStream, setLocalStream] = useState()
  const [captureStream, setCaptureStream] = useState()
  const [myPeerId, setMyPeerId] = useState(null)

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
  }, [])

  useEffect(() => {
    if (socket) {
      socket.on('connection', () => {
        setSocketID(socket.id)
      })
      socket.on('broadcast', (data) => {
        let { event, groupCallRooms } = data
        switch (event) {
          case 'GROUP_CALL_ROOMS':
            console.log(groupCallRooms)
            setCallRooms(groupCallRooms)

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
  }, [socket, socketID, localStream])

  const getInitialCallRooms = (data) => {
    let options = {}
    if (data) {
      options = { filter: 'harthId', harthId: data.harthid }
    }
    socket && socket.emit('get-initial-call-rooms', options)
  }
  const createEmptyRoom = (data) => {
    socket && socket.emit('create-call-room', data)
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

  const addVideoStream = (incomingStream, peerid) => {
    console.log(groupCallStreams, peerid)
    let groupstreams = { ...groupCallStreams, [peerid]: incomingStream }
    setGroupCallStreams(groupstreams)
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
    <VideoContext.Provider
      value={{
        socket,
        localStream,
        socketID,
        callRooms,
        groupCallStreams,
        captureStream,
        getLocalStream,
        getInitialCallRooms,
        createEmptyRoom,
        getScreenCapture,
        leaveGroupCall,
        connectWithMyPeer,
      }}
    >
      {children}
    </VideoContext.Provider>
  )
}

export const useVideo = () => useContext(VideoContext)

// import { resolveHref } from 'next/dist/next-server/lib/router/router'
// import { createContext, useState, useContext, useEffect } from 'react'
// import socketClient from 'socket.io-client'

// const VideoContext = createContext({})

// let myPeer
// let groupCallStreams = []

// export const VideoProvider = ({ children }) => {
//   const [socket, setSocket] = useState(null)
//   const [callRooms, setCallRooms] = useState([])
//   const [socketID, setSocketID] = useState(null)
//   const [localStream, setLocalStream] = useState()
//   const [captureStream, setCaptureStream] = useState()

//   const [videoStreams, setVideoStreams] = useState([])
//   const [remoteStream, setRemoteStream] = useState(null)
//   const [myPeerId, setMyPeerId] = useState(null)
//   const [callState, setCallState] = useState(null)

//   const [callStates, setCallStates] = useState({
//     CALL_UNAVAILABLE: 'CALL_UNAVAILABLE',
//     CALL_AVAILABLE: 'CALL_AVAILABLE',
//     CALL_REQUESTED: 'CALL_REQUESTED',
//     CALL_IN_PROGRESS: 'CALL_IN_PROGRESS',
//   })
//   const [defaultConstrains, setDefaultConstrains] = useState({
//     video: {
//       width: 480,
//       height: 360,
//     },
//     audio: false,
//   })
//   const [configuration, setConfiguration] = useState({
//     iceServers: [
//       {
//         urls: 'stun:stun.l.google.com:13902',
//       },
//     ],
//   })

//   useEffect(() => {
//     let urls = {
//       development: 'http://localhost:5000',
//       production: 'https://project-blarg-video-socket.herokuapp.com',
//     }
//     setSocket(socketClient(urls[process.env.NODE_ENV]))
//   }, [])

//   useEffect(() => {
//     if (socket) {
//       socket.on('connection', () => {
//         setSocketID(socket.id)
//       })
//       socket.on('broadcast', (data) => {
//         let { event, groupCallRooms } = data
//         switch (event) {
//           case 'GROUP_CALL_ROOMS':
//             setCallRooms(groupCallRooms)
//             break

//           default:
//             break
//         }
//       })
//       socket.on('group-call-join-request', (data) => {
//         console.log('another user has joined', data)
//         connectToNewUser(data)
//       })
//       socket.on('group-call-user-left', (data) => {
//         console.log('user stream to be removed', data)
//         removeInactiveStream(data)
//       })
//     }
//   }, [socket, socketID, localStream])

//   const getInitialCallRooms = () => {
//     socket && socket.emit('get-initial-call-rooms')
//   }
//   const createEmptyRoom = (data) => {
//     socket && socket.emit('create-call-room', data)
//   }
//   const getLocalStream = async () => {
//     let stream = await navigator.mediaDevices.getUserMedia(defaultConstrains)
//     setLocalStream(stream)
//   }
//   const getScreenCapture = async () => {
//     try {
//       let capture = await navigator.mediaDevices.getDisplayMedia({
//         video: {
//           cursor: 'always',
//         },
//         audio: false,
//       })

//       if (capture) {
//         setCaptureStream(capture)
//       }
//     } catch (err) {
//       console.error('Error: ' + err)
//     }
//   }
// const connectWithMyPeer = (data) => {
//   myPeer = new window.Peer(undefined, {
//     path: '/peerjs',
//     host: '/',
//     port: '5000',
//   })

//   myPeer.on('open', (peerid) => {
//     setMyPeerId(peerid)
//     joinGroupCall(peerid, data)
//   })

//   myPeer.on('call', async (call) => {
//     console.log('incommiing call....', call)
//     if (localStream) {
//       call.answer(localStream)
//     } else {
//       let initialAudio = await navigator.mediaDevices.getUserMedia({
//         video: false,
//         audio: true,
//       })
//       call.answer(initialAudio)
//     }

//     call.on('stream', (incomingStream) => {
//       console.log('incoming stream ....', incomingStream)
//       if (incomingStream) {
//         const streams = groupCallStreams
//         const stream = streams.find(
//           (stream) => stream && stream.id === incomingStream.id,
//         )

//         if (!stream) {
//           addVideoStream(incomingStream)
//         }
//       }
//     })
//   })
// }
//   const joinGroupCall = (peerid, data) => {
//     let { roomId, userIcon, userName } = data
//     userWantsToJoinGroupCall({
//       userName,
//       userIcon,
//       peerId: peerid,
//       socketID,
//       roomId,
//       localStreamId: (localStream || {}).id || '',
//     })
//   }
//   const userWantsToJoinGroupCall = (data) => {
//     socket && socket.emit('group-call-join-request', data)
//   }
//   const addVideoStream = (incomingStream) => {
//     groupCallStreams = [...groupCallStreams, incomingStream]
//     setVideoStreams(groupCallStreams)
//   }
//   const connectToNewUser = async (data) => {
//     let initialAudio = await navigator.mediaDevices.getUserMedia({
//       video: false,
//       audio: true,
//     })
//     console.log('connecting...', initialAudio)
//     if (myPeer) {
//       const call = myPeer.call(data.peerId, initialAudio)
//       call.on('stream', (incomingStream) => {
//         console.log('incoming stream...', incomingStream)
//         if (incomingStream) {
//           console.log(incomingStream.id, groupCallStreams)
//           const streams = groupCallStreams
//           const stream = streams.find(
//             (stream) => stream && stream.id === incomingStream.id,
//           )

//           if (!stream) {
//             addVideoStream(incomingStream)
//           }
//         }
//       })
//     }
//   }
//   const leaveGroupCall = (data) => {
//     return new Promise((res, rej) => {
//       socket &&
//         socket.emit('group-call-user-left', data, (response) => {
//           console.log(response)
//           if (response.ok) {
//             res(true)
//           }

//           if (myPeer) {
//             myPeer.destroy()
//           }
//         })
//     })
//   }
//   const removeInactiveStream = (data) => {
//     groupCallStreams = groupCallStreams.filter(
//       (stream) => stream.id !== data.streamId,
//     )
//   }

//   return (
//     <VideoContext.Provider
//       value={{
//         socket,
//         localStream,
//         socketID,
//         callRooms,
//         groupCallStreams,
//         captureStream,
//         connectWithMyPeer,
//         getLocalStream,
//         getInitialCallRooms,
//         createEmptyRoom,
//         leaveGroupCall,
//         getScreenCapture,
//       }}
//     >
//       {children}
//     </VideoContext.Provider>
//   )
// }

// export const useVideo = () => useContext(VideoContext)
