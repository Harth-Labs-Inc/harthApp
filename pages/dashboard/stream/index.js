import { doc } from 'prettier'
import { useEffect, useRef, useState, useReducer } from 'react'
import io from 'socket.io-client'
import { getTurnServers } from '../../../util/TURN'

import styles from './Stream.module.scss'

let myPeer
let ScreenSharePeer
let groupStreams = {}
let groupCaptStreams = {}
let chatPannel = false
let userInfo = {}

const Stream = () => {
  //chat
  const [unreadMsg, setUnreadMsg] = useState(false)
  const [newChatMsg, setNewChatMsg] = useState({})
  const [chats, setChats] = useState([])
  const [showChatPannel, setShowChatPannel] = useState(false)

  const [userName, setUserName] = useState('')
  const [userIcon, setUserIcon] = useState('')
  const [roomId, setRoomId] = useState('')
  const [harthId, setHarthId] = useState('')
  const [socket, setSocket] = useState(null)
  const [socketID, setSocketID] = useState(null)
  const [callRooms, setCallRooms] = useState([])
  const [groupCallStreams, setGroupCallStreams] = useState({})
  const [groupCaptureStreams, setGroupCaptureStreams] = useState({})

  const [localStream, setLocalStream] = useState()
  const [localStreamChange, setLocalStreamChange] = useState(0)

  const [isSharingVideo, setIsSharingVideo] = useState(false)
  const [isSharingCapture, setIsSharingCapture] = useState(false)

  const [captureStream, setCaptureStream] = useState()
  const [Peers, setPeers] = useState([])
  const [muteOn, setMuteOn] = useState(true)
  const [videoOn, setVideoOn] = useState(false)
  const [options, setOptions] = useState(false)
  const [gridSize, setGridSize] = useState('alone')

  // part state
  const [outsideDiceRoll, setOutsideDiceRoll] = useState({})
  const [outsideVoteCall, setOutsideVoteCall] = useState({})

  const mainRef = useRef()
  const localVidRef = useRef()
  const captureVidRef = useRef()
  const groupCaptureVidRef = useRef([])
  const groupStreamsRef = useRef([])
  const chatInput = useRef()

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

  useEffect(() => {
    console.log('local stream has changed')
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        if (track.kind === 'video') {
          let enabled = track.enabled
          setVideoOn(enabled)
        }
        if (track.kind === 'audio') {
          let enabled = track.enabled
          setMuteOn(enabled)
        }
      })
    }
  }, [localStreamChange])

  // ------- socket connection and listeners ------------

  useEffect(() => {
    if (socketID && localStream && !myPeer) {
      if (userName && roomId) {
        connectWithMyPeer({ userName, userIcon, roomId })
      }
    }
  }, [socketID, localStream])

  useEffect(() => {
    if (socket) {
      socket.on('connection', () => {
        setSocketID(socket.id)
      })
      socket.on('broadcast', (data) => {
        let { event, groupCallRooms, peers } = data
        console.log(data)
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

      socket.on('party-event', (data) => {
        setOutsideDiceRoll({ ...data })
      })

      socket.on('user-left', (data) => {
        console.log('user-left')
        if (myPeer) {
          for (let conns in myPeer.connections) {
            myPeer.connections[conns].forEach((conn, index, array) => {
              if (data.peerId === conns) {
                conn.peerConnection.close()
                if (conn.close) conn.close()
              }
            })
          }
        }
        removeVideo(data.peerId)
        delete groupStreams[data.peerId]
      })
      socket.on('screen-share-close', (data) => {
        let streams = { ...groupCaptureStreams }
        delete streams[data.id]
        groupCaptStreams = streams
        setGroupCaptureStreams(streams)
        removeVideo(data.id)
        let remoteGroupCaptureVideo = groupCaptureVidRef
        if (remoteGroupCaptureVideo) {
          remoteGroupCaptureVideo = remoteGroupCaptureVideo.current
          if (remoteGroupCaptureVideo) {
            remoteGroupCaptureVideo.srcObject = null
          }
        }
      })

      // chat
      socket.on('incoming-chat-message', (data) => {
        if (!chatPannel) {
          setUnreadMsg(true)
        }
        setChats((prevChats) => [...prevChats, data])
      })
      socket.on('chat-update', (chats) => {
        setChats(chats)
      })
      socket.on('userInfo-update', (info) => {
        userInfo = info

        let activeScreenShare = 0
        let activeVideoStream = 0

        Object.entries(info || {}).forEach(([usr, i]) => {
          if (i.connected) {
            if (i.screenShare) {
              activeScreenShare += 1
            }
            if (i.video) {
              activeVideoStream += 1
            }
          }
        })

        setIsSharingCapture(!!activeScreenShare)
        setIsSharingVideo(!!activeVideoStream)
      })
      // vote
      socket.on('incoming-vote', (data) => {
        setOutsideVoteCall({ ...data })
      })
    }
  }, [socket])

  useEffect(() => {
    if (Peers.length === 1) {
      setGridSize('alone')
    }
    if (Peers.length === 2) {
      setGridSize('full')
    }
    if (Peers.length > 2 && Peers.length <= 7) {
      setGridSize('double-wide')
    }
    if (Peers.legnth > 7) {
      setGridSize('three-wide')
    }
  }, [Peers])

  // ----------- media --------------

  useEffect(() => {
    if (localStream) {
      console.log('just got local stream', localStream, myPeer)
      createVideo({ id: 'owner', stream: localStream })
    }
  }, [localStream])

  useEffect(() => {
    if (captureStream) {
      createCaptureVideo({ id: ScreenSharePeer?.id, stream: captureStream })
      connectCaptureUsers(true)
    }
  }, [captureStream])

  useEffect(() => {
    // if (Object.keys(groupStreams).length) {
    //   Object.values(groupStreams).forEach((stream, idx) => {
    //     const remoteGroupCallVideo = groupStreamsRef.current[idx]
    //     if (remoteGroupCallVideo) {
    //       remoteGroupCallVideo.srcObject = stream
    //       remoteGroupCallVideo.onloadedmetadata = () => {
    //         remoteGroupCallVideo.play()
    //       }
    //     }
    //   })
    // }
  }, [groupCallStreams])

  useEffect(() => {
    // if (Object.keys(groupCaptStreams).length) {
    //   Object.values(groupCaptStreams).forEach((str, idx) => {
    //     const remoteGroupCallVideo = groupCaptureVidRef.current[idx]
    //     if (remoteGroupCallVideo) {
    //       if (str.owner && str.owner === ScreenSharePeer.id) {
    //         console.log('is owner video')
    //       } else {
    //         console.log('is owner video')
    //         remoteGroupCallVideo.srcObject = str.stream
    //         remoteGroupCallVideo.onloadedmetadata = () => {
    //           remoteGroupCallVideo.play()
    //         }
    //       }
    //     }
    //   })
    // }
  }, [groupCaptureStreams])

  const startVideo = () => {
    getLocalStream('video')
  }
  const stopVideoOnly = (stream) => {
    console.log('stopvideo')
    try {
      stream.getTracks().forEach((track) => {
        if (track.readyState == 'live' && track.kind === 'video') {
          let enabled = track.enabled
          track.enabled = !enabled

          console.log(!enabled, 'sadfasdfadf')
          let newMsg = {}
          if (!enabled === false) {
            newMsg = {
              value: `${userName} disconnected video`,
              code: 6,
              userName: userName,
              roomId: roomId,
              date: new Date(),
              creator_name: 'Admin',
              flames: [],
              reactions: [],
              attachments: [],
            }
          } else {
            newMsg = {
              value: `${userName} enabled video`,
              code: 5,
              userName: userName,
              roomId: roomId,
              date: new Date(),
              creator_name: 'Admin',
              flames: [],
              reactions: [],
              attachments: [],
            }
          }
          console.log(newMsg)
          sendNewChatMessage(newMsg)
          setLocalStreamChange((prev) => (prev += 1))
        }
      })
    } catch (error) {}
  }
  const startAudio = () => {
    getLocalStream('audio')
  }
  const stopAudioOnly = (stream) => {
    console.log('stopaudio')
    try {
      stream.getTracks().forEach((track) => {
        if (track.readyState == 'live' && track.kind === 'audio') {
          let enabled = track.enabled
          track.enabled = !enabled
          console.log(!enabled, 'sadfasdfadf')
          let newMsg = {}
          if (!enabled === false) {
            newMsg = {
              value: `${userName} disconnected audio`,
              code: 4,
              userName: userName,
              roomId: roomId,
              date: new Date(),
              creator_name: 'Admin',
              flames: [],
              reactions: [],
              attachments: [],
            }
          } else {
            newMsg = {
              value: `${userName} enabled audio`,
              code: 3,
              userName: userName,
              roomId: roomId,
              date: new Date(),
              creator_name: 'Admin',
              flames: [],
              reactions: [],
              attachments: [],
            }
          }
          console.log(newMsg)
          sendNewChatMessage(newMsg)
          setLocalStreamChange((prev) => (prev += 1))
        }
      })
    } catch (error) {}
  }
  const startCapture = () => {
    getScreenCapture()
  }
  const stopCapture = () => {
    let tracks = captureVidRef?.current.srcObject.getTracks()

    tracks.forEach((track) => track.stop())
    captureVidRef.current.srcObject = null
  }
  const toggleVideo = () => {
    if (!localStream) {
      startVideo()
    } else {
      try {
        localStream.getTracks().forEach((track) => {
          if (track.kind === 'video') {
            stopVideoOnly(localStream)
          }
        })
      } catch (error) {}
    }
    setLocalStreamChange((prev) => (prev += 1))
  }
  const toggleAudio = () => {
    if (!localStream) {
      startAudio()
    } else {
      try {
        localStream.getTracks().forEach((track) => {
          console.log(track)
          if (track.kind === 'audio') {
            stopAudioOnly(localStream)
          }
        })
      } catch (error) {}
    }
    setLocalStreamChange((prev) => (prev += 1))
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
    setLocalStreamChange((prev) => (prev += 1))
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
        capture.getTracks().forEach((track) => {
          if (track) {
            track.onended = () => {
              let newMsg = {
                value: `${userName} disconnected screen share`,
                code: 2,
                roomId: roomId,
                userName: userName,
                date: new Date(),
                creator_name: 'Admin',
                flames: [],
                reactions: [],
                attachments: [],
              }

              console.log(newMsg)
              sendNewChatMessage(newMsg)
              onScreenShareClose()
              console.info('ScreenShare has ended')
            }
          }
        })
        let newMsg = {
          value: `${userName} enabled screen share`,
          code: 1,
          userName: userName,
          roomId: roomId,
          date: new Date(),
          creator_name: 'Admin',
          flames: [],
          reactions: [],
          attachments: [],
        }

        console.log(newMsg)
        sendNewChatMessage(newMsg)
        setCaptureStream(capture)
      }
    } catch (err) {}
  }
  const onScreenShareClose = () => {
    if (socket) {
      const remoteGroupCaptureVideo = groupCaptureVidRef.current
      try {
        remoteGroupCaptureVideo.srcObject = null
      } catch (error) {}

      socket.emit('screen-share-closed', { roomId, id: ScreenSharePeer.id })
      removeVideo(ScreenSharePeer.id)
    }
  }
  const addVideoStream = (incomingStream, peerid) => {
    console.log(incomingStream, 'incoming stream')
    setGroupCallStreams((prevStreams) => {
      return { ...prevStreams, [peerid]: incomingStream }
    })

    groupStreams = {
      ...groupStreams,
      [peerid]: incomingStream,
    }

    createVideo({ id: peerid, stream: incomingStream })
  }
  const addCaptureStream = (incomingStream, peerid, owner) => {
    setGroupCaptureStreams((prevStreams) => {
      return { ...prevStreams, [peerid]: incomingStream }
    })

    groupCaptStreams = {
      ...groupCaptStreams,
      [peerid]: {
        stream: incomingStream,
        owner: owner ? ScreenSharePeer.id : undefined,
      },
    }
    createCaptureVideo({ id: peerid, stream: incomingStream })
  }
  const toggleOptions = () => {
    setOptions(!options)
  }
  const toggleChat = () => {
    setShowChatPannel((prevState) => {
      let newvalue = !prevState
      if (newvalue === true) {
        setUnreadMsg(false)
      }
      chatPannel = newvalue
      return newvalue
    })
  }

  // ------------ rooms -----------------

  const leaveRoom = () => {
    leaveGroupCall({ roomId, userName, socketID }, () => {
      console.log(finished, 'fffffffffffffffffffffffffffff')
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

      let { roomId, userIcon, userName } = data
      let obj = {
        userName,
        userIcon,
        peerId: peerid,
        socketID,
        roomId,
        localStreamId: (localStream || {}).id || '',
        harthId,
      }
      createScreenSharePeer(obj)
    })

    myPeer.on('error', function (err) {
      console.log(err)
      myPeer.reconnect()
    })

    myPeer.on('disconnect', function (client) {
      console.log('disconnect with id ' + client.id)
      removeVideo(client.id)
    })

    myPeer.on('connection', function (dataConnection) {
      console.log('connected to peer', dataConnection)
    })
    myPeer.on('close', function (client) {
      console.log('video share closing')
      removeVideo(client.id)
    })

    myPeer.on('call', async (call) => {
      if (localStream) {
        call.answer(localStream)
      }

      call.on('stream', (incomingStream) => {
        if (incomingStream) {
          console.log('new incoming stream', incomingStream, groupStreams)
          addVideoStream(incomingStream, call.peer)
        }
      })
      call.on('close', () => {
        console.log('closing peers listeners', call.peer)
        removeVideo(call.peer)
      })
      call.on('error', () => {
        console.log('peer error ------')
        removeVideo(call.peer)
      })
    })
  }
  const joinGroupCall = (obj) => {
    userWantsToJoinGroupCall(obj)
  }
  const userWantsToJoinGroupCall = (data) => {
    socket &&
      socket.emit('group-call-join-request', data, ({ peers, chats }) => {
        connectToUsers(peers)
        setChats(chats)
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
  const connectCaptureUsers = async (isOwner) => {
    if (ScreenSharePeer) {
      Peers.forEach((peer) => {
        if (peer.capturePeer !== ScreenSharePeer.id) {
          const call = ScreenSharePeer.call(peer.capturePeer, captureStream)
          call &&
            call.on('stream', (incomingStream) => {
              if (incomingStream) {
                addCaptureStream(incomingStream, ScreenSharePeer.id, isOwner)
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
            try {
              window.close()
            } catch (error) {}
            let urls = {
              test: `http://localhost:3000`,
              development: 'http://localhost:3000/',
              production: 'https://project-blarg-next.vercel.app/',
            }

            window.location.replace(urls[process.env.NODE_ENV])
          }

          if (myPeer) {
            myPeer.destroy()
          }
        })
    })
  }
  // ------------ chat -----------------
  const sendNewChatMessage = (message) => {
    socket &&
      socket.emit('send-chat-message', message, () => {
        setChats((prevChats) => [...prevChats, message])
      })
  }
  const chatInputHandler = (e) => {
    const { value } = e.target
    setNewChatMsg({ value })
  }
  const chatSubmitHandler = (e) => {
    e.preventDefault()
    let message = {
      ...newChatMsg,
      roomId: roomId,
      code: 0,
      date: new Date(),
      creator_name: userName,
      userName: userName,
      creator_image: userIcon,
      flames: [],
      reactions: [],
      attachments: [],
    }

    sendNewChatMessage(message)
  }
  const chatClassname = (creator) => {
    if (creator === 'Admin') {
      return 'admin'
    }
    if (creator === userName) {
      return 'self'
    }
    return 'incoming'
  }
  const ChatStructure = ({ chat }) => {
    const date = new Date(chat.date)
    return (
      <>
        <p>{chat.value}</p>
        <span>
          <img src={chat.creator_image} alt={chat.creator_name} />
          {/* {timeStamp} */}
        </span>
      </>
    )
  }
  // --------------- screen share ----------
  const createScreenSharePeer = (peerobj) => {
    let pID = ''
    ScreenSharePeer = new window.Peer(undefined, {
      config: {
        iceServers: [
          ...getTurnServers(),
          {
            url: 'stun:stun.1und1.de:3478',
          },
        ],
      },
    })

    ScreenSharePeer.on('open', (peerid) => {
      console.log('my screen share  peer id is ', peerid)
      pID = peerid
      peerobj.capturePeer = peerid
      joinGroupCall(peerobj)
    })

    ScreenSharePeer.on('error', function (err) {
      console.log(err)
      ScreenSharePeer.reconnect()
    })

    ScreenSharePeer.on('connection', function (dataConnection) {
      console.log('connected to peer', dataConnection)
    })

    ScreenSharePeer.on('disconnect', function (client) {
      // this will give you id in text or whatever format you are using
      // console.log('screen share disconnect with id ' + client.id)
      // removeVideo(client.id)
    })

    ScreenSharePeer.on('call', async (call) => {
      console.log('call', call)

      call.answer()

      call.on('stream', (incomingStream) => {
        if (incomingStream) {
          console.log('new incoming capture stream')

          addCaptureStream(incomingStream, call.peer)
        }
      })
      call.on('close', () => {
        console.log('closing capture listeners', call.peer)
        removeVideo(call.peer)
      })
      call.on('error', () => {
        console.log('capture error ------')
        removeVideo(call.peer)
      })
    })
  }

  // new video
  const createVideo = (createObj) => {
    console.log('trying to create video tag ', createObj)
    if (!createObj) {
      createObj = {}
    }
    let match = document.getElementById(createObj?.id)
    console.log('match', match)
    if (!match) {
      console.log('cideo caontainer', videoContainer)
      const roomContainer = document.getElementById(
        'stream-window-peer-container',
      )
      console.log('video room container', roomContainer)
      const videoContainer = document.createElement('div')
      console.log('video child tag', videoContainer)
      if (videoContainer) {
        videoContainer.id = `parent-${createObj?.id}`
        videoContainer.classList.add('video-parent')
        const video = document.createElement('video')
        video.srcObject = createObj?.stream
        video.id = createObj?.id
        video.autoplay = true
        if (createObj?.id === 'owner') video.muted = true
        videoContainer.appendChild(video)
        roomContainer.append(videoContainer)
      }
    } else {
      let el = document.getElementById(createObj?.id)
      if (el) {
        el.srcObject = createObj?.stream
      }
    }
  }

  const createCaptureVideo = (createObj) => {
    if (!createObj) {
      createObj = {}
    }
    let match = document.getElementById(createObj?.id)
    console.log('match', match)
    if (!match) {
      console.log('cideo caontainer', videoContainer)
      const roomContainer = document.getElementById(
        'stream-window-capture-container',
      )
      const videoContainer = document.createElement('div')
      if (videoContainer) {
        videoContainer.id = `parent-${createObj?.id}`
        videoContainer.classList.add('video-parent')
        const video = document.createElement('video')
        video.srcObject = createObj?.stream
        video.id = createObj?.id
        video.autoplay = true
        if (myPeer.id === createObj?.id) video.muted = true
        videoContainer.appendChild(video)
        roomContainer.append(videoContainer)
      }
    } else {
      let el = document.getElementById(createObj?.id)
      if (el) {
        el.srcObject = createObj?.stream
      }
    }
  }

  const removeVideo = (id) => {
    if (id) {
      const video = document.getElementById(`parent-${id}`)
      if (video) video.remove()
    }
  }

  return (
    <main id="stream-window" ref={mainRef}>
      <section id="stream-window-video-container">
        <div id="stream-window-title">
          {callRooms[0] ? `${callRooms[0].roomName}` : null}
        </div>
        <ul role="nav" id="stream-window-controls">
          <div className="list-left">
            <li onClick={leaveRoom}>
              <button id="leave_room">leave</button>
            </li>
          </div>
          <div className="list-center">
            <li onClick={toggleAudio}>
              <button id={muteOn ? 'unmuted' : 'muted'}>mute</button>
            </li>
            <li onClick={toggleVideo}>
              <button id={videoOn ? 'stream' : 'no_stream'}>stream</button>
            </li>
            <li onClick={toggleOptions}>
              <button id="options" className={options ? 'active' : null}>
                options
              </button>
            </li>
            <li onClick={toggleCapture}>
              <button id="screen_share">share screen</button>
            </li>
            <li
              className={`
                ${unreadMsg ? 'unread' : ''}
                ${showChatPannel ? 'open' : 'closed'}`}
              onClick={toggleChat}
            >
              <button id="chat">chat</button>
            </li>
          </div>
        </ul>

        <section id="stream-window-grid">
          {/* <video
            ref={localVidRef}
            id="localVideo"
            autoPlay
            playsInline
            muted={true}
          /> */}
          <section id="stream-window-capture-container">
            {/* {ScreenSharePeer &&
              Object.entries(groupCaptureStreams || []).map((str, idx) => {
                if (str[0] && str[0] !== ScreenSharePeer.id) {
                  console.log('video map', idx)
                  return (
                    <video
                      style={{ height: '100px', width: '100px' }}
                      key={idx}
                      ref={(el) => (groupCaptureVidRef.current[idx] = el)}
                      id={`remoteVideo-${idx}`}
                      autoPlay
                      playsInline
                    />
                  )
                }
                return null
              })} */}
          </section>
          <section id="stream-window-peer-container" className={gridSize}>
            {/* {myPeer &&
              (Peers || [])
                .filter((peer) => peer.peerId !== myPeer._id)
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
                })} */}
          </section>
        </section>
      </section>
      <section
        id="stream-window-chat"
        className={showChatPannel ? 'open' : 'closed'}
      >
        <ul>
          {chats.map((chat, index) => {
            return (
              <li key={index} className={chatClassname(chat.creator_name)}>
                {chat.creator_name === 'Admin' ? (
                  chat.value
                ) : (
                  <ChatStructure chat={chat} />
                )}
              </li>
            )
          })}
        </ul>
        <form id="chat_input_container" onSubmit={chatSubmitHandler}>
          <textarea
            id="chat_input_box"
            type="text"
            onChange={chatInputHandler}
            ref={chatInput}
          />
          <div>
            <div className="chat-insert-additional-wrapper"></div>
            <div className="chat-controls">
              <button className="send-message" type="submit">
                Send
              </button>
            </div>
          </div>
        </form>
      </section>
    </main>
  )
}

export default Stream
