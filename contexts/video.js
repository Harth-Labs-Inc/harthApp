import { createContext, useState, useContext, useEffect } from 'react'
import socketClient from 'socket.io-client'

const VideoContext = createContext({})

let myPeer
let groupCallStreams = []

export const VideoProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const [callRooms, setCallRooms] = useState([])
  const [socketID, setSocketID] = useState(null)
  const [localStream, setLocalStream] = useState()
  const [videoStreams, setVideoStreams] = useState([])
  const [remoteStream, setRemoteStream] = useState(null)
  const [myPeerId, setMyPeerId] = useState(null)
  const [callState, setCallState] = useState(null)

  const [callStates, setCallStates] = useState({
    CALL_UNAVAILABLE: 'CALL_UNAVAILABLE',
    CALL_AVAILABLE: 'CALL_AVAILABLE',
    CALL_REQUESTED: 'CALL_REQUESTED',
    CALL_IN_PROGRESS: 'CALL_IN_PROGRESS',
  })
  const [defaultConstrains, setDefaultConstrains] = useState({
    video: {
      width: 480,
      height: 360,
    },
    audio: false,
  })
  const [configuration, setConfiguration] = useState({
    iceServers: [
      {
        urls: 'stun:stun.l.google.com:13902',
      },
    ],
  })

  useEffect(() => {
    let urls = {
      development: 'http://localhost:5000',
      production: 'https://project-blarg-video-socket.herokuapp.com',
    }
    setSocket(socketClient(urls[process.env.NODE_ENV]))
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
            setCallRooms(groupCallRooms)
            break

          default:
            break
        }
      })
      socket.on('group-call-join-request', (data) => {
        console.log('look over here')
        connectToNewUser(data)
      })
    }
  }, [socket])

  const getInitialCallRooms = () => {
    socket && socket.emit('get-initial-call-rooms')
  }
  const createEmptyRoom = (data) => {
    console.log(data)
    socket && socket.emit('create-call-room', data)
  }
  const getLocalStream = async () => {
    let stream = await navigator.mediaDevices.getUserMedia(defaultConstrains)
    setLocalStream(stream)
  }
  const connectWithMyPeer = (data) => {
    myPeer = new window.Peer(undefined, {
      path: '/peerjs',
      host: '/',
      port: '5000',
    })

    myPeer.on('open', (peerid) => {
      setMyPeerId(peerid)
      joinGroupCall(peerid, data.roomId)
    })

    myPeer.on('call', async (call) => {
      if (localStream) {
        call.answer(localStream)
      } else {
        let initialAudio = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        })
        call.answer(initialAudio)
      }

      call.on('stream', (incomingStream) => {
        if (incomingStream) {
          const streams = groupCallStreams
          const stream = streams.find(
            (stream) => stream && stream.id === incomingStream.id,
          )

          if (!stream) {
            addVideoStream(incomingStream)
          }
        }
      })
    })
  }
  const joinGroupCall = (peerid, roomId) => {
    userWantsToJoinGroupCall({
      peerId: peerid,
      socketID,
      roomId,
      localStreamId: (localStream || {}).id || '',
    })
  }
  const userWantsToJoinGroupCall = (data) => {
    socket && socket.emit('group-call-join-request', data)
  }
  const addVideoStream = (incomingStream) => {
    groupCallStreams = [...groupCallStreams, incomingStream]
    setVideoStreams(groupCallStreams)
  }
  const connectToNewUser = async (data) => {
    let initialAudio = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    })
    if (myPeer) {
      const call = myPeer.call(data.peerId, initialAudio)
      call.on('stream', (incomingStream) => {
        if (incomingStream) {
          console.log(incomingStream.id, groupCallStreams)
          const streams = groupCallStreams
          const stream = streams.find(
            (stream) => stream && stream.id === incomingStream.id,
          )

          if (!stream) {
            addVideoStream(incomingStream)
          }
        }
      })
    }
  }

  return (
    <VideoContext.Provider
      value={{
        localStream,
        socketID,
        callRooms,
        groupCallStreams,
        connectWithMyPeer,
        getLocalStream,
        getInitialCallRooms,
        createEmptyRoom,
      }}
    >
      {children}
    </VideoContext.Provider>
  )
}

export const useVideo = () => useContext(VideoContext)
