import React, { createContext, useState, useContext, useEffect } from 'react'
import { useComms } from './comms'
import { getMessagesByTopic, getRepliesByOwner } from '../requests/chat'

const ChatContext = createContext({})

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState({})
  const { selectedTopic } = useComms()
  const [replies, setReplies] = useState({})
  const [selectedReplyOwner, setSelectedReplyOwner] = useState({})

  useEffect(() => {
    if (selectedTopic && selectedTopic._id) {
      if (!(selectedTopic._id in messages)) {
        messages[selectedTopic._id] = []

        ;(async () => {
          let data = await getMessagesByTopic(selectedTopic._id)

          const { ok, fetchResults } = data
          if (ok) {
            setMessages({
              ...messages,
              [selectedTopic._id]: sortMessages(fetchResults),
            })
          }
        })()
      }
    }
  }, [selectedTopic])

  useEffect(() => {
    if (selectedReplyOwner && selectedReplyOwner._id) {
      if (!(selectedReplyOwner._id in replies)) {
        messages[selectedReplyOwner._id] = []

        ;(async () => {
          let data = await getRepliesByOwner(selectedReplyOwner._id)

          const { ok, fetchResults } = data
          if (ok) {
            setReplies({
              ...replies,
              [selectedReplyOwner._id]: fetchResults,
            })
          }
        })()
      }
    }
  }, [selectedReplyOwner])

  const sortMessages = (msgs) => {
    return msgs.sort((a, b) => new Date(a.date) - new Date(b.date)).reverse()
  }

  return (
    <ChatContext.Provider
      value={{
        messages,
        setMessages,
        setSelectedReplyOwner,
        replies,
        setReplies,
        selectedReplyOwner,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export const useChat = () => useContext(ChatContext)
