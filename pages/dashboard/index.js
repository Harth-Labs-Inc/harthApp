import { useState, useEffect } from 'react'
import Router, { useRouter } from 'next/router'
import { CommsProvider } from '../../contexts/comms'
import { SocketProvider } from '../../contexts/socket'
import { ChatProvider } from '../../contexts/chat'
import { VideoProvider } from '../../contexts/video'
import NavLayout from '../../components/dashLayout'

import Chat from './chat'
import Game from './game'
import Events from './events'
import Gather from './gather'
import Party from './party'
import Classic from './classic'
import Video from './video'

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
  console.log(currentPage)
  let page
  switch (currentPage) {
    case 'gather':
      // page = <Game />
      page = (
        <VideoProvider>
          <Video />
        </VideoProvider>
      )
      break
    case 'stream':
      page = <Party />
      break
    case 'classic':
      page = (
        <VideoProvider>
          <Classic />
        </VideoProvider>
      )
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
