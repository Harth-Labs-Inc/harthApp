import { useState, useEffect } from 'react'
import Router, { useRouter } from 'next/router'
import { CommsProvider } from '../../contexts/comms'
import { SocketProvider } from '../../contexts/socket'
import { ChatProvider } from '../../contexts/chat'
import NavLayout from '../../components/dashLayout'

import Chat from './chat'
import Game from './game'
import Events from './events'
import Gather from './gather'
import Stream from './stream'
import Classic from './classic'

const dashboard = (props) => {
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState('chat')
  const [GatherWindow, setGatherWindow] = useState('')

  const router = useRouter()
  const {
    query: { tkn },
  } = router

  useEffect(() => {
    if (tkn) {
      Router.push(`/comm?tkn=${tkn}`)
    } else {
      setLoading(false)
    }
  }, [tkn])

  useEffect(() => {
    const queryString = window.location.search
    const urlParams = new URLSearchParams(queryString)
    const gatherWindow = urlParams.get('gather_window')
    const roomType = urlParams.get('room_type')
    if (gatherWindow) setGatherWindow(gatherWindow)
    if (roomType) {
      changePageHandler(roomType)
    }
  }, [])

  const changePageHandler = (pg) => {
    setCurrentPage(pg)
  }

  let page
  switch (currentPage) {
    case 'gather':
      page = <Game />
      break
    case 'stream':
      page = <Stream />
      break
    case 'classic':
      page = <Classic />
      break
    case 'gather':
      page = <Gather />
      break
    case 'events':
      page = <Events />
      break
    default:
      page = <Chat />
      break
  }

  return (
    <>
      {loading ? (
        ''
      ) : (
        <CommsProvider>
          <ChatProvider>
            <SocketProvider>
              {GatherWindow ? (
                page
              ) : (
                <NavLayout
                  changePage={changePageHandler}
                  currentPage={currentPage}
                >
                  {page}
                </NavLayout>
              )}
            </SocketProvider>
          </ChatProvider>
        </CommsProvider>
      )}
    </>
  )
}

export default dashboard
