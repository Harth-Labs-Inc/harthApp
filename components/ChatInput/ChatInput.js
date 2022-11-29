import { useContext, useState, useRef, useEffect } from 'react'

import {
  saveMessage,
  updateMessage,
  saveMessageReply,
  addReplyID,
} from '../../requests/chat'
import { useComms } from '../../contexts/comms'
import { useAuth } from '../../contexts/auth'
import { useSocket } from '../../contexts/socket'
import { MobileContext } from '../../contexts/mobile'
import { getUploadURL, putImageInBucket } from '../../requests/s3'
import { addKeyToDB } from '../../requests/chat'

import { Picker } from 'emoji-mart'
// import 'emoji-mart/css/emoji-mart.css'

import styles from './ChatInput.module.scss'

const ChatInput = (props) => {
  const [attachments, setAttachments] = useState([])
  const [emojiPickerState, setEmojiPicker] = useState(false)
  const [selectedEditMsg, setSelectedEditMsg] = useState({})
  const [altKey, setAltKey] = useState(false)
  const { isMobile } = useContext(MobileContext)

  const { user } = useAuth()
  const { selectedcomm, selectedTopic } = useComms()
  const { emitUpdate } = useSocket()

  const { selectedEdit, isReply, replyOwner, topicInputs, setTopicInputs } =
    props

  const textRef = useRef()
  const fileRef = useRef()
  const attRefs = useRef([])

  useEffect(() => {
    if (attachments.length > 0) {
      attachments.forEach((file, idx) => {
        var reader = new FileReader()
        reader.onload = function (e) {
          const { result } = e.target
          attRefs.current[idx].src = result
        }
        reader.readAsDataURL(file)
      })
    }
  }, [attachments])

  useEffect(() => {
    if (setTopicInputs) {
      setTopicInputs({
        ...topicInputs,
        [selectedTopic._id]: selectedEdit?.message,
      })
    }

    setSelectedEditMsg(selectedEdit)
  }, [selectedEdit])

  const calcHeight = (value) => {
    let numberOfLineBreaks = (value.match(/\n/g) || []).length
    let newHeight = 20 + numberOfLineBreaks * 20 + 12 + 2
    return newHeight
  }
  const inputHandler = (e) => {
    const { value } = e.target
    setTopicInputs({ ...topicInputs, [selectedTopic._id]: value })
  }
  const sendMessagge = async () => {
    if (selectedTopic) {
      let creator = selectedcomm.users.find((usr) => usr.userId === user._id)

      let newMessage = {
        creator_id: user._id,
        creator_name: creator.name,
        creator_image: creator.iconKey,
        topic_id: selectedTopic._id,
        comm_id: selectedcomm._id,
        bookmarked: false,
        date: new Date(),
        message: topicInputs[selectedTopic._id],
        flames: [],
        reactions: [],
        attachments: [],
        replies: [],
      }

      const data = await saveMessage(newMessage)

      let { id, ok } = data
      if (ok) {
        if (id) {
          newMessage._id = id
        }
        if (attachments.length > 0) {
          uploadAttacments(id, newMessage)
        } else {
          broadcastMessage(newMessage)
        }
      }
    }
  }
  const sendReply = async () => {
    if (selectedTopic) {
      let creator = selectedcomm.users.find((usr) => usr.userId === user._id)

      let newMessage = {
        creator_id: user._id,
        creator_name: creator.name,
        creator_image: creator.iconKey,
        topic_id: selectedTopic._id,
        comm_id: selectedcomm._id,
        bookmarked: false,
        date: new Date(),
        message: topicInputs[selectedTopic._id],
        owner_id: replyOwner._id,
        flames: [],
        reactions: [],
        attachments: [],
        replies: [],
      }

      const data = await saveMessageReply(newMessage)

      let { id, ok } = data
      if (ok) {
        if (id) {
          newMessage._id = id
          const addReply = await addReplyID(
            id,
            replyOwner._id,
            replyOwner.owner_id ? true : false,
          )
        }
        if (attachments.length > 0) {
          uploadAttacments(id, newMessage)
        } else {
          broadcastMessage(newMessage)
        }
      }
    }
  }
  const broadcastMessage = (message) => {
    setAttachments([])
    message.updateType = 'new message'
    setTopicInputs({ ...topicInputs, [selectedTopic._id]: '' })
    emitUpdate(selectedcomm._id, message, async (err, status) => {
      if (err) {
        console.log(err)
      }
    })
  }
  const getPastedData = (e) => {
    const { files } = e.clipboardData
    const text = e.clipboardData.getData('Text')
    if (files[0]) {
      addAttachment(files[0])
    }
    if (text) {
    }
  }
  const openFileSelector = () => {
    fileRef.current.click()
  }
  const addAttachment = (file) => {
    setAttachments([...attachments, file])
  }
  const removeAttachment = (idx) => {
    const tempAttachments = [...attachments]
    tempAttachments.splice(idx, 1)
    setAttachments([...tempAttachments])
  }
  const dropHandler = (e) => {
    e.preventDefault()
    const { files } = e.dataTransfer
    addAttachment(files[0])
  }
  const uploadAttacments = async (id, message) => {
    let promises = []
    attachments.forEach((file, idx) => {
      promises.push(
        new Promise(async (res, rej) => {
          let extention = file.name.split('.').pop()
          let name = `${id}_${idx + 1}.${extention}`
          let bucket = 'topic-message-attachments'
          const data = await getUploadURL(name, file.type, bucket)
          const { ok, uploadURL } = data
          if (ok) {
            let reader = new FileReader()
            reader.addEventListener('loadend', async () => {
              let result = await putImageInBucket(uploadURL, reader, file.type)
              let { status } = result
              if (status == 200) {
                await addKeyToDB(id, name, file.type)
                res({ name, fileType: file.type })
              }
            })
            reader.readAsArrayBuffer(file)
          }
        }),
      )
    })

    const outputs = await Promise.all(promises)
    message.attachments = outputs
    broadcastMessage(message)
  }
  const addEmoji = (e) => {
    let msg = topicInputs[selectedTopic._id] + e.native
    setTopicInputs({ ...topicInputs, [selectedTopic._id]: msg })
    setEmojiPicker(!emojiPickerState)
  }
  const EmojiPicker = () => {
    if (emojiPickerState) {
      return (
        <Picker
          className="attach-emoji"
          native={true}
          onSelect={addEmoji}
          emoji=""
          color="#1d0a6c"
          autoFocus={true}
        />
      )
    }
    return null
  }
  const triggerPicker = (event) => {
    event.preventDefault()
    setEmojiPicker(!emojiPickerState)
  }
  const ImageHolder = () => {
    if (attachments.length > 0) {
      return (
        <div className="image-holder">
          {(attachments || []).map((file, idx) => (
            <div className="image-to-attach">
              <img
                id={file.name}
                key={file.name}
                ref={(el) => (attRefs.current[idx] = el)}
                alt=""
                style={{ height: '100px', width: '100px' }}
              />
              <button
                className="remove-image"
                onClick={() => {
                  removeAttachment(idx)
                }}
              >
                remove image
              </button>
            </div>
          ))}
        </div>
      )
    }

    return null
  }
  const cancelEdit = () => {
    setTopicInputs({ ...topicInputs, [selectedTopic._id]: '' })
    setSelectedEditMsg({})
  }
  const updateMsg = async () => {
    let msg = selectedEditMsg
    msg.message = topicInputs[selectedTopic._id]
    await updateMessage(msg)
    msg.updateType = 'message update'
    msg.action = 'update'
    emitUpdate(selectedcomm._id, msg, async (err, status) => {
      if (err) {
        console.log(err)
      }
      let { ok } = status
      if (ok) {
        cancelEdit()
      }
    })
  }
  const submitMessageLogic = () => {
    if (isReply) {
      sendReply()
    } else {
      sendMessagge()
    }
  }
  const MessageSubmits = () => {
    const isDisabled =
      ((topicInputs && topicInputs[selectedTopic._id]) || '').trim().length ===
        0 && attachments.length == 0
    if (Object.keys(selectedEditMsg).length > 0) {
      return (
        <div id={styles.ChatInputControlsRight}>
          <button className={styles.CancelEdit} onClick={cancelEdit}>
            cancel
          </button>
          <button
            className={styles.SendMessage}
            disabled={isDisabled}
            onClick={updateMsg}
          >
            send
          </button>
        </div>
      )
    } else {
      return (
        <div id={styles.ChatInputControlsRight}>
          <button
            className={styles.SendMessage}
            disabled={isDisabled}
            onClick={() => {
              submitMessageLogic()
            }}
          >
            send
          </button>
        </div>
      )
    }
  }
  return (
    <div id={styles.ChatInput}>
      <ImageHolder />
      <textarea
        id={styles.ChatInputText}
        ref={textRef}
        onChange={inputHandler}
        value={(topicInputs && topicInputs[selectedTopic._id]) || ''}
        onKeyDown={(e) => {
          let input = topicInputs[selectedTopic._id] || ''
          if (e.altKey) {
            setAltKey(true)
          }
          if (e.key == 'Enter' && altKey) {
            input = input + '\r\n'
            setTopicInputs({ ...topicInputs, [selectedTopic._id]: input })
            textRef.current.style.height =
              calcHeight(textRef.current.value) + 'px'
          } else if (e.key === 'Enter' && input.trim().length > 0) {
            submitMessageLogic()
          }
        }}
        onKeyUp={(e) => {
          setAltKey(false)
        }}
        onPaste={getPastedData}
        onDragEnter={(e) => {
          e.preventDefault()
          return false
        }}
        onDragOver={(e) => {
          e.preventDefault()
        }}
        onDrop={(e) => {
          e.preventDefault()
          dropHandler(e)
        }}
        onDragLeave={(e) => {
          e.preventDefault()
        }}
      ></textarea>
      {!isMobile ? (
        <div id={styles.ChatInputControls}>
          <div id={styles.ChatInputControlsLeft}>
            <button className={styles.AttachEmoji} onClick={triggerPicker}>
              attach emoji
            </button>
            <EmojiPicker />
            {/* <button className={styles.AttachGif}>attach gif</button> */}
            <button onClick={openFileSelector} className={styles.AttachFile}>
              attach file
            </button>
            <input
              ref={fileRef}
              type="file"
              id="file-input"
              onChange={(e) => {
                const { files } = e.target
                addAttachment(files[0])
              }}
              style={{ display: 'none' }}
            />
          </div>
          <MessageSubmits />
        </div>
      ) : null}
    </div>
  )
}

export default ChatInput
