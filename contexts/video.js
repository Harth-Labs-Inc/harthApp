import { createContext, useState, useContext, useEffect } from 'react'
import socketClient from 'socket.io-client'

const VideoContext = createContext({})

export const VideoProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const [remoteStream, setRemoteStream] = useState(null)
  const [groupCallStreams, setGroupCallStreams] = useState(null)
  const [callState, setCallState] = useState(null)
  const [myPeerId, setMyPeerId] = useState(null)
  //   const [peerConnection, setPeerConnection] = useState(null)
  const [localStream, setLocalStream] = useState()
  const [callRooms, setCallRooms] = useState([])
  const [socketID, setSocketID] = useState(null)
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
    audio: true,
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
        console.log('succesfully connected with wss server')
        console.log(socket.id)
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
    }
  }, [socket])

  const registerNewUser = (data) => {
    socket &&
      socket.emit('register-new-user', {
        username: data.name,
        id: data.socketId,
        HarthID: data.harthid,
      })
  }
  const registerGroupCall = (data) => {
    socket && socket.emit('group-call-register', data)
  }
  const createEmptyRoom = (data) => {
    socket && socket.emit('create-call-room', data)
  }
  const getLocalStream = async () => {
    let stream = await navigator.mediaDevices.getUserMedia(defaultConstrains)
    setLocalStream(stream)
  }
  const createPeerConnection = () => {
    let peerConnection = new RTCPeerConnection(configuration)

    if (peerConnection) {
      //   setPeerConnection(tempPeerConnection)
      for (const track of localStream.getTracks()) {
        peerConnection.addTrack(track, localStream)
      }

      peerConnection.ontrack = ({ streams: [stream] }) => {
        setRemoteStream(stream)
      }

      // incoming data channel messages
      peerConnection.ondatachannel = (event) => {
        const dataChannel = event.channel

        dataChannel.onopen = () => {
          console.log(
            'peer connection is ready to receive data channel messages',
          )
        }

        dataChannel.onmessage = (event) => {
          setMessage(true, event.data)
        }
      }

      let dataChannel = peerConnection.createDataChannel('chat')
      console.log(dataChannel)

      dataChannel.onopen = () => {
        console.log('chat data channel succesfully opened')
      }

      peerConnection.onicecandidate = (event) => {
        console.log('geeting candidates from stun server')
        if (event.candidate) {
          sendWebRTCCandidate({
            candidate: event.candidate,
            connectedUserSocketId: connectedUserSocketId,
          })
        }
      }

      peerConnection.onconnectionstatechange = (event) => {
        if (peerConnection.connectionState === 'connected') {
          console.log('succesfully connected with other peer')
        }
      }
    }
  }
  const connectWithMyPeer = () => {
    let myPeer = new window.Peer(undefined, {
      path: '/peerjs',
      host: '/',
      port: '5000',
    })

    myPeer.on('open', (id) => {
      console.log('succesfully connected with peer server', id)
      setMyPeerId(id)
    })

    myPeer.on('call', (call) => {
      call.answer(localStream)
      call.on('stream', (incomingStream) => {
        const streams = groupCallStreams
        const stream = streams.find((stream) => stream.id === incomingStream.id)

        if (!stream) {
          addVideoStream(incomingStream)
        }
      })
    })
  }

  const addVideoStream = (incomingStream) => {
    const groupCallStreams = [...groupCallStreams, incomingStream]

    setGroupCallStreams(groupCallStreams)
  }

  return (
    <VideoContext.Provider
      value={{
        connectWithMyPeer,
        createPeerConnection,
        localStream,
        getLocalStream,
        socketID,
        registerGroupCall,
        registerNewUser,
        createEmptyRoom,
        callRooms,
      }}
    >
      {children}
    </VideoContext.Provider>
  )
}

export const useVideo = () => useContext(VideoContext)
