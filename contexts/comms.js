import React, { createContext, useState, useContext, useEffect } from 'react'
import { getComms, getTopics } from '../requests/community'
import { getRooms } from '../requests/rooms'
import { useAuth } from './auth'

const CommsContext = createContext({})

export const CommsProvider = ({ children }) => {
  const [comms, setComms] = useState(null)
  const [selectedcomm, setSelectedcomm] = useState(null)
  const [topics, setTopics] = useState(null)
  const [rooms, setRooms] = useState({})
  const [selectedTopic, setSelectedTopic] = useState({})

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
      grabTopics(selectedcomm._id)
      grabRooms(selectedcomm._id)
    }
  }, [selectedcomm])

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
    setSelectedTopic(topic)
  }
  const addNewTopic = (newTopic) => {
    setTopics([...topics, newTopic])
  }

  return (
    <CommsContext.Provider
      value={{
        rooms,
        setRooms,
        grabTopics,
        comms,
        setComm,
        selectedcomm,
        topics,
        addNewTopic,
        setTopic,
        selectedTopic,
      }}
    >
      {children}
    </CommsContext.Provider>
  )
}

export const useComms = () => useContext(CommsContext)
