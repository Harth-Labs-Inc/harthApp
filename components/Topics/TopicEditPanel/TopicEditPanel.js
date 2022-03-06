import { useEffect, useState } from 'react'
import { CSSTransition } from 'react-transition-group'

import { useComms } from '../../../contexts/comms'
import { useAuth } from '../../../contexts/auth'
import { useSocket } from '../../../contexts/socket'

import { CloseBtn } from '../../Common/Button'
import { ToggleSwitch, TextButton } from '../../Common'
import Modal from '../../Modal'

import TopicMemberList from './TopicMemberList'
import TopicAddList from './TopicMemberList'

import TopicEditForm from './TopicEditForm'
import styles from './TopicEditMenu.module.scss'

import {
  getTopicByID,
  deleteTopicByID,
  updatedTopic,
  getTopics,
} from '../../../requests/community'

export default function TopicEditPanel(props) {
  const { togglePanel } = props
  const { selectedTopic, topicChangeHandler, selectedcomm } = useComms()
  const { emitUpdate } = useSocket()

  const { user } = useAuth()

  const [userInfo, setUserInfo] = useState({})
  const [showLeaveModal, setShowLeaveModal] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showMembersList, setShowMembersList] = useState(false)
  const [showAddList, setShowAddList] = useState(false)

  const [currentMembers, setCurrentMembers] = useState([])
  const [currentAddMembers, setCurrentAddMembers] = useState([])

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
    topicChangeHandler({
      type: 'mute',
      status,
      user: userInfo,
    })
    setUserInfo({
      ...userInfo,
      muted: status,
    })
  }

  const toggleLeaveModal = () => {
    setShowLeaveModal((prevState) => !prevState)
  }
  const toggleEditForm = () => {
    setShowEditForm((prevState) => !prevState)
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
  const MemberListPanel = () => {
    return showMembersList ? (
      <TopicMemberList
        memberList={currentMembers}
        closeMemberList={toggleMembersList}
        clickHandler={() => {}}
      />
    ) : null
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
  const leaveTopicHandler = () => {
    topicChangeHandler({
      type: 'leave',
      status: false,
      user: userInfo,
    })
  }
  const editSubmitHandler = async (newTopicDetails) => {
    let tempTopic = {
      ...selectedTopic,
      ['title']: newTopicDetails['title'],
      ['description']: newTopicDetails['description'],
    }
    await updatedTopic({ type: 'replace', topic: tempTopic })
    let msg = {}
    msg.updateType = 'topic edited'
    msg.comm = selectedcomm
    msg.topic = tempTopic
    emitUpdate(selectedcomm._id, msg, async (err, status) => {
      if (err) {
        console.log(err)
      }
      console.log(status)
    })
  }
  const TopicEditPanel = () => {
    return showEditForm ? (
      <TopicEditForm
        closeEditForm={toggleEditForm}
        editSubmitHandler={editSubmitHandler}
      />
    ) : null
  }

  const toggleAddList = async () => {
    let current = !showAddList
    if (current) {
      let result = await getTopics(selectedcomm._id, user._id)
      const { ok, topics } = result
      if (ok) {
        let members = {}
        topics.forEach((topic) => {
          if (topic && topic.members) {
            topic?.members
              ?.filter(Boolean)
              .forEach((member) => (members[member?.name] = member))
          }
        })
        setCurrentAddMembers(Object.values(members))
      }
    }
    setShowAddList((prevState) => !prevState)
  }

  const AddListPanel = () => {
    return showAddList ? (
      <TopicMemberList
        memberList={currentAddMembers}
        closeMemberList={toggleAddList}
        clickHandler={addUserToTopic}
      />
    ) : null
  }

  const addUserToTopic = async ({ member, index }) => {
    let tempMember = {
      ...member,
      admin: false,
      muted: false,
    }
    let match = selectedTopic.members.find((m) => m.name === member.name)
    if (!match) {
      let tempTopic = {
        ...selectedTopic,
        ['members']: [...selectedTopic.members, tempMember],
      }

      await updatedTopic({ type: 'replace', topic: tempTopic })
      let msg = {}
      msg.updateType = 'topic edited'
      msg.comm = selectedcomm
      msg.topic = tempTopic
      emitUpdate(selectedcomm._id, msg, async (err, status) => {
        if (err) {
          console.log(err)
        }
        console.log(status)
      })
    }
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
      <CSSTransition
        in={showAddList}
        timeout={0}
        classNames="memberListAnimation"
      >
        <AddListPanel />
      </CSSTransition>
      {showLeaveModal ? (
        <Modal show={showLeaveModal} onToggleModal={setShowLeaveModal}>
          <p>
            You are about to leave <br /> {(selectedTopic || {}).title}{' '}
          </p>
          <p>You must be invited back to rejoin.</p>
          <TextButton type="button" onClick={leaveTopicHandler} text="Leave" />

          <TextButton type="button" onClick={toggleLeaveModal} text="Cancel" />
        </Modal>
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
              className={`${styles.topicSettingsButton} ${styles.topicSettingsButtonArrow}`}
              onClick={toggleMembersList}
            >
              Members
            </button>
          </li>
          {userInfo.admin ? (
            <>
              <li>
                <button
                  className={`${styles.topicSettingsButton} ${styles.topicSettingsButtonArrow}`}
                  onClick={toggleAddList}
                >
                  Add People
                </button>
              </li>
              <li>
                <button
                  className={`${styles.topicSettingsButton} ${styles.topicSettingsButtonEdit}`}
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
