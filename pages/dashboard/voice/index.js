import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createSocketConnectionInstance } from '../../../services/connection'
import { getObjectFromUrl } from '../../../services/helper'
import ChatBox from '../../../components/RoomChatBox'

const RoomComponent = (props) => {
  let socketInstance = useRef(null)
  const [micStatus, setMicStatus] = useState(true)
  const [camStatus, setCamStatus] = useState(true)
  const [streaming, setStreaming] = useState(false)
  const [chatToggle, setChatToggle] = useState(false)
  const [userDetails, setUserDetails] = useState(null)
  const [displayStream, setDisplayStream] = useState(false)
  const [messages, setMessages] = useState([])

  useEffect(() => {
    let params = getObjectFromUrl()
    handleuserDetails(params)
    return () => {
      socketInstance.current?.destoryConnection()
    }
  }, [])

  useEffect(() => {
    if (userDetails) startConnection()
  }, [userDetails])

  const startConnection = () => {
    let params = getObjectFromUrl()
    if (!params) params = { quality: 12 }
    socketInstance.current = createSocketConnectionInstance({
      updateInstance: updateFromInstance,
      params,
      userDetails,
    })
  }
  const updateFromInstance = (key, value) => {
    console.log('updated from instance', key, value)
    if (key === 'streaming') setStreaming(value)
    if (key === 'message') setMessages(value)
    if (key === 'displayStream') setDisplayStream(value)
  }

  const handleDisconnect = () => {
    socketInstance.current?.destoryConnection()
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
  const handleMyMic = () => {
    const { getMyVideo, reInitializeStream } = socketInstance.current
    const myVideo = getMyVideo()
    if (myVideo)
      myVideo.srcObject?.getAudioTracks().forEach((track) => {
        if (track.kind === 'audio')
          // track.enabled = !micStatus;
          micStatus ? track.stop() : reInitializeStream(camStatus, !micStatus)
      })
    setMicStatus(!micStatus)
  }
  const handleMyCam = () => {
    if (!displayStream) {
      const { toggleVideoTrack } = socketInstance.current
      toggleVideoTrack({ video: !camStatus, audio: micStatus })
      setCamStatus(!camStatus)
    }
  }
  const handleuserDetails = (userDetails) => {
    setUserDetails({ ...userDetails, roomID: userDetails.room_id })
  }

  const chatHandle = (bool = false) => {
    setChatToggle(bool)
  }
  const toggleScreenShare = () => {
    const { reInitializeStream, toggleVideoTrack } = socketInstance.current
    displayStream && toggleVideoTrack({ video: false, audio: true })
    reInitializeStream(
      false,
      true,
      !displayStream ? 'displayMedia' : 'userMedia',
    ).then(() => {
      setDisplayStream(!displayStream)
      setCamStatus(false)
    })
  }
  console.log('cam status', camStatus)
  console.log('mic status', micStatus)
  return (
    <>
      {userDetails !== null && !streaming && (
        <div className="stream-loader-wrapper">
          <p>loading...</p>
        </div>
      )}
      <div id="room-container"></div>
      <div className="footbar-wrapper">
        {streaming && (
          <div
            className="status-action-btn mic-btn"
            onClick={handleMyMic}
            title={micStatus ? 'Disable Mic' : 'Enable Mic'}
          >
            mic
          </div>
        )}
        <div
          className="status-action-btn end-call-btn"
          onClick={handleDisconnect}
          title="End Call"
        >
          disconnect
        </div>
        {streaming && (
          <div
            className="status-action-btn cam-btn"
            onClick={handleMyCam}
            title={camStatus ? 'Disable Cam' : 'Enable Cam'}
          >
            video
          </div>
        )}
      </div>
      <div>
        {/* <div className="screen-share-btn" onClick={toggleScreenShare}>
          <h4 className="screen-share-btn-text">
            {displayStream ? 'Stop Screen Share' : 'Share Screen'}
          </h4>
        </div> */}
        <div
          onClick={() => chatHandle(!chatToggle)}
          className="chat-btn"
          title="Chat"
        >
          chat
        </div>
      </div>
      <ChatBox
        chatToggle={chatToggle}
        closeDrawer={() => chatHandle(false)}
        socketInstance={socketInstance.current}
        myDetails={userDetails}
        messages={messages}
      ></ChatBox>
    </>
  )
}
export default RoomComponent
