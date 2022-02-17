import { useState } from 'react'
import TopicsSideNav from '../../../components/TopicsSideNav'
import TopicsMenu from '../../../components/TopicsMenu'
import MessagesWrapper from '../../../components/messagesWrapper'
import { useSocket } from '../../../contexts/socket'

const Messages = (prop) => {
  const [showEditPanel, setShowEditPanel] = useState(false)

  const toggleEditPanel = () => {
    setShowEditPanel(!showEditPanel)
  }

  return (
    <>
      <p>This is messages</p>
      {/* <TopicsSideNav />
      <section
        id="topic_active"
        className={showEditPanel ? 'topic-edit-active' : undefined}
      >
        <TopicsMenu on_toggle_panel={toggleEditPanel} />
        <div id="topic_messages_container">
          <MessagesWrapper />
        </div>
      </section>
      {showEditPanel && <EditPanel />} */}
    </>
  )
}

export default Messages
