import React, { createContext, useState, useContext, useEffect } from 'react'
import { getComms, getTopics, updatedTopic } from '../requests/community'
import { getRooms } from '../requests/rooms'
import { useAuth } from './auth'
import { Context } from '../pages/_app'

const CommsContext = createContext({})

export const CommsProvider = ({ children }) => {
  const [value, dispatch] = useContext(Context)

  const [comms, setComms] = useState(null)
  const [selectedcomm, setSelectedcomm] = useState(null)
  const [topics, setTopics] = useState(null)
  const [rooms, setRooms] = useState({})
  const [selectedTopic, setSelectedTopic] = useState({})
  const [topicChange, setTopicChange] = useState(0)

  const { user } = useAuth()
  const { incomingTopic } = useAuth()

  useEffect(() => {
    if (user) {
      if (user.comms.length > 0) {
        ;(async () => {
          let result = await getComms(user)
          const { ok, comms } = result
          if (ok) {
            setComms(comms)
          }
        })()
      }
    }
  }, [user])

  useEffect(() => {
    if (selectedcomm && user) {
      setTopicChange(0)

      grabTopics(selectedcomm._id)
      grabRooms(selectedcomm._id)
    }
  }, [selectedcomm])

  useEffect(() => {
    localStorage.setItem('selected_topic', JSON.stringify(selectedTopic))
  }, [selectedTopic])

  const grabTopics = async (comid) => {
    let result = await getTopics(comid, user._id)
    const { ok, topics } = result
    if (ok) {
      setTopics(topics)
      setSelectedTopic(topics[0] || {})
    }
  }
  const grabRooms = async (comid) => {
    if (comid) {
      if (!(comid in rooms)) {
        rooms[comid] = []
        let result = await getRooms(comid, user._id)
        const { ok, rms } = result
        if (ok) {
          setRooms({ ...rooms, [comid]: rms })
        }
      }
    }
  }
  const setComm = async (comm) => {
    setSelectedcomm(comm)
  }
  const setTopic = async (topic) => {
    setTopicChange((prevState) => (prevState += 1))
    setSelectedTopic(topic)
  }
  const addNewTopic = (newTopic) => {
    setTopics([...topics, newTopic])
  }
  const topicChangeHandler = async ({ type, status, user }) => {
    console.log('topic change called: ', { type, status })
    let tmpTopics = [...topics]
    let matchingTopicIndex = -1
    let tmpSelectedTopic = { ...selectedTopic }
    tmpTopics.forEach((topic, index) => {
      if (topic._id === selectedTopic._id) {
        matchingTopicIndex = index
      }
    })
    if (matchingTopicIndex >= 0) {
      switch (type) {
        case 'mute':
          tmpSelectedTopic?.members?.filter(Boolean).forEach((member) => {
            if (member._id === user._id) {
              member.muted = status
            }
          })
          await updatedTopic({ type: 'replace', topic: tmpSelectedTopic })
          tmpTopics[matchingTopicIndex] = tmpSelectedTopic
          setTopics(tmpTopics)
          break
        case 'leave':
          let newMembers = tmpSelectedTopic?.members.filter((member, index) => {
            if (member && member._id !== user._id) {
              return member
            }
            return false
          })
          console.log(newMembers)
          tmpSelectedTopic.members = newMembers
          await updatedTopic({ type: 'replace', topic: tmpSelectedTopic })
          tmpTopics[matchingTopicIndex] = tmpSelectedTopic
          setTopics(tmpTopics)
          grabTopics(selectedcomm._id)
          grabRooms(selectedcomm._id)
          break
        default:
          break
      }
    }
  }

  return (
    <CommsContext.Provider
      value={{
        rooms,
        topicChange,
        setRooms,
        grabTopics,
        comms,
        setComm,
        selectedcomm,
        topics,
        addNewTopic,
        setTopic,
        selectedTopic,
        topicChangeHandler,
        setTopics,
        setSelectedTopic,
      }}
    >
      {children}
    </CommsContext.Provider>
  )
}

export const useComms = () => useContext(CommsContext)
