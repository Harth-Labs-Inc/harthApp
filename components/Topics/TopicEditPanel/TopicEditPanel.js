import { useEffect, useState } from 'react'
import { CSSTransition } from 'react-transition-group'

import { useComms } from '../../../contexts/comms'
import { useAuth } from '../../../contexts/auth'
import { useSocket } from '../../../contexts/socket'

import { CloseBtn } from '../../Common/Button'
import { ToggleSwitch } from '../../Common'

import TopicMemberList from './TopicMemberList'
import TopicEditForm from './TopicEditForm'
import styles from './TopicEditMenu.module.scss'

import { getTopicByID, deleteTopicByID } from '../../../requests/community'

export default function TopicEditPanel(props) {
  const { togglePanel } = props
  const { selectedTopic, topicChangeHandler, selectedcomm } = useComms()
  const { emitUpdate } = useSocket()

  const { user } = useAuth()

  const [userInfo, setUserInfo] = useState({})
  const [showLeaveModal, setShowLeaveModal] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showMembersList, setShowMembersList] = useState(false)
  const [currentMembers, setCurrentMembers] = useState([])

  const TopicState = () => {
    if (selectedTopic.private === true) {
      return 'Private'
    } else {
      return 'Public'
    }
  }

  useEffect(() => {
    if (selectedTopic && user) {
      let owner = selectedTopic?.members
        ?.filter(Boolean)
        .find((member) => member?.user_id === user._id)
      if (owner) {
        setUserInfo(owner)
      }
    }
  }, [selectedTopic])

  const toggleHandler = (toggle, status) => {
    setUserInfo({
      ...userInfo,
      muted: status,
    })
    topicChangeHandler({
      type: 'mute',
      status,
      user: userInfo,
    })
  }

  const toggleLeaveModal = () => {
    setShowLeaveModal((prevState) => !prevState)
  }
  const toggleEditForm = () => {
    setShowEditForm((prevState) => !prevState)
  }

  const leaveTopicHandler = () => {
    topicChangeHandler({
      type: 'leave',
      status: false,
      user: userInfo,
    })
  }

  const toggleMembersList = async () => {
    let current = !showMembersList
    if (current) {
      let result = await getTopicByID(selectedTopic._id)
      let { members } = result.data

      setCurrentMembers(members)
    }
    setShowMembersList((prevState) => !prevState)
  }

  const toggleDeleteModal = async () => {
    await deleteTopicByID(selectedTopic._id)
    let msg = {}
    msg.updateType = 'topic deleted'
    msg.comm = selectedcomm
    msg.topic = selectedTopic
    emitUpdate(selectedcomm._id, msg, async (err, status) => {
      if (err) {
        console.log(err)
      }
      console.log(status)
    })
  }

  const TopicEditPanel = () => {
    return showEditForm ? (
      <TopicEditForm closeEditForm={toggleEditForm} />
    ) : null
  }
  const MemberListPanel = () => {
    return showMembersList ? (
      <TopicMemberList
        memberList={currentMembers}
        closeMemberList={toggleMembersList}
      />
    ) : null
  }

  return (
    <>
      <CSSTransition
        in={showEditForm}
        timeout={0}
        classNames="editFormAnimation"
      >
        <TopicEditPanel />
      </CSSTransition>
      <CSSTransition
        in={showMembersList}
        timeout={0}
        classNames="memberListAnimation"
      >
        <MemberListPanel />
      </CSSTransition>
      {showLeaveModal ? (
        <div
          style={{
            position: 'fixed',
            zIndex: 100,
            background: 'white',
            padding: 10,
            border: '1px solid black',
          }}
        >
          <p>are you sure you want to leave room</p>
          <button type="button" onClick={toggleLeaveModal}>
            CANCEL
          </button>
          <button type="button" onClick={leaveTopicHandler}>
            Yes, I'm sure
          </button>
        </div>
      ) : null}
      <section className={styles.topicSettings}>
        <header>
          <div className={styles.topicSettingsHeader}>
            <span>
              <p className={styles.topicSettingsHeaderTitle}>
                {(selectedTopic || {}).title}
              </p>
              <TopicState />
            </span>
            <CloseBtn onClick={togglePanel} />
          </div>
        </header>
        <p className={styles.topicSettingsDescription}>
          {selectedTopic.description}
        </p>
        <div className={styles.topicSettingsMute}>
          <ToggleSwitch
            onToggleChange={toggleHandler}
            toggleName="name"
            isChecked={userInfo?.muted || false}
          />
          Mute
        </div>

        <ul className={styles.topicSettingsControls}>
          <li>
            <button
              className={styles.topicSettingsButton}
              onClick={toggleMembersList}
            >
              Members
            </button>
          </li>
          {userInfo.admin ? (
            <>
              <li>
                <button className={styles.topicSettingsButton}>
                  Add People
                </button>
              </li>
              <li>
                <button
                  className={styles.topicSettingsButton}
                  onClick={toggleEditForm}
                >
                  Edit
                </button>
              </li>
              <li>
                <button
                  className={styles.topicSettingsButton}
                  onClick={toggleDeleteModal}
                >
                  Delete
                </button>
              </li>
            </>
          ) : null}
          <li>
            <button
              className={styles.topicSettingsButton}
              onClick={toggleLeaveModal}
            >
              Leave
            </button>
          </li>
        </ul>
      </section>
    </>
  )
}
