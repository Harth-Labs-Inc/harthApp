import React, { useState } from 'react'
import { getMessageDateOrTime } from '../services/helper'

function ChatBox(props) {
  console.log(props, 'message box')
  const [chatText, setChatText] = useState('')

  const handleChatText = (event) => {
    const { value } = event.target
    setChatText(value)
  }

  const handleSendText = (event) => {
    if (!(chatText.length > 0)) return
    if (event.type === 'keyup' && event.key !== 'Enter') {
      return
    }
    const messageDetails = {
      message: {
        message: chatText,
        timestamp: new Date(),
      },
      userData: { ...props.myDetails },
    }
    props.socketInstance.boradcastMessage(messageDetails)
    setChatText('')
  }

  return (
    <React.Fragment>
      <div
        className="chat-drawer"
        anchor={'right'}
        open={props.chatToggle}
        onClose={props.closeDrawer}
      >
        <div className="chat-head-wrapper">
          <div
            className="chat-drawer-back-icon"
            onClick={props.closeDrawer}
          ></div>
          <div className="chat-header">
            <h3 className="char-header-text">Chat</h3>
          </div>
        </div>
        <div className="chat-drawer-list">
          {props.messages?.map((chatDetails, index) => {
            const { userData, message } = chatDetails
            return (
              <div key={index} className="message-container">
                <div
                  className={`message-wrapper ${
                    userData && !userData.userID ? 'message-wrapper-right' : ''
                  }`}
                >
                  <div className="message-title-wrapper">
                    <h5 className="message-name">{userData?.name}</h5>
                    <span className="message-timestamp">
                      {getMessageDateOrTime(message?.timestamp)}
                    </span>
                  </div>
                  <p className="actual-message">{message?.message}</p>
                </div>
              </div>
            )
          })}
        </div>
        <div className="chat-drawer-input-wrapper" onKeyUp={handleSendText}>
          <input
            type="text"
            className="chat-drawer-input"
            onChange={handleChatText}
            value={chatText}
            placeholder="Type Here"
          />
          <button onClick={handleSendText}>Send</button>
        </div>
      </div>
    </React.Fragment>
  )
}

export default ChatBox
