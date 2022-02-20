import { useContext, useState, useEffect } from 'react'
import { CSSTransition } from 'react-transition-group'

import TopicsSideNav from '../../../components/TopicsSideNav'
import TopicsMenu from '../../../components/TopicsMenu'
import ChatMessages from '../../../components/ChatMessages/ChatMessages'
import TopicEditPanel from '../../../components/Topics/TopicEditPanel/TopicEditPanel'
import { useSocket } from '../../../contexts/socket'
import { useComms } from '../../../contexts/comms'
import { Context } from '../../../pages/_app'

const Chat = (prop) => {
  const { topicChange } = useComms()
  const [value] = useContext(Context)
  const [showEditPanel, setShowEditPanel] = useState(false)
  const [chatVisible, setChatVisible] = useState(false)

  useEffect(() => {
    console.log('test', topicChange)
    if (value.screenSize === 'isMobile' && topicChange) {
      setChatVisible(true)
    } else {
      setChatVisible(false)
    }
  }, [topicChange])

  const toggleEditPanel = () => {
    setShowEditPanel(!showEditPanel)
  }

  const topicChatClasses = () => {
    const classes = []
    if (showEditPanel) {
      classes.push('topic-edit-active')
    }
    if (value.screenSize === 'isMobile' && chatVisible) {
      classes.push('chatVisible')
    }
    return classes.join(' ')
  }

  const toggleMobileMenu = () => {
    setChatVisible((prevState) => !prevState)
  }

  const TopicPanel = () => {
    return showEditPanel ? (
      <TopicEditPanel togglePanel={toggleEditPanel} />
    ) : null
  }

  return (
    <>
      <TopicsSideNav />
      <section id="topic_active" className={topicChatClasses()}>
        <TopicsMenu
          on_toggle_panel={toggleEditPanel}
          toggleMobileMenu={toggleMobileMenu}
        />
        <div id="topic_messages_container">
          <ChatMessages />
        </div>
      </section>
      <CSSTransition
        in={showEditPanel}
        timeout={0}
        classNames="topicPanelAnimation"
      >
        <TopicPanel />
      </CSSTransition>
    </>
  )
}

export default Chat
