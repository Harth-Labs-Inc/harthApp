import React, { useState } from 'react'
import { useComms } from '../contexts/comms'
import { useChat } from '../contexts/chat'

const TopicsMenu = (props) => {
  const { selectedTopic } = useComms()
  const { on_toggle_panel } = props

  const { selectedReplyOwner, setSelectedReplyOwner } = useChat()

  const removeReplyOwner = () => {
    setSelectedReplyOwner({})
  }

  const TopicTitle = () => {
    if (Object.keys(selectedReplyOwner).length > 0) {
      return (
        <>
          <p id="topic_title">
            <button onClick={removeReplyOwner}>back</button> Side Conversation
          </p>
        </>
      )
    } else {
      return <p id="topic_title">{(selectedTopic || {}).title}</p>
    }
  }

  return (
    <header>
      <TopicTitle />
      <span>
        <button id="topic_menu_toggle" onClick={on_toggle_panel}>
          menu
        </button>
      </span>
    </header>
  )
}

export default TopicsMenu
