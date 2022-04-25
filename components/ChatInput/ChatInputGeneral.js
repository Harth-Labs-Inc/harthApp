import { useContext, useState, useRef, useEffect } from 'react'
import { MobileContext } from '../../contexts/mobile'
import { Picker } from 'emoji-mart'
import styles from './ChatInput.module.scss'

const GeneralChatInput = ({ onSubmitHandler }) => {
  const [attachments, setAttachments] = useState([])
  const [messageText, setMessageText] = useState('')
  const [altKey, setAltKey] = useState(false)
  const [emojiPickerState, setEmojiPicker] = useState(false)

  const textRef = useRef()
  const fileRef = useRef()
  const attRefs = useRef([])

  const { isMobile } = useContext(MobileContext)

  const removeAttachment = (idx) => {
    const tempAttachments = [...attachments]
    tempAttachments.splice(idx, 1)
    setAttachments([...tempAttachments])
  }

  const ImageHolder = () => {
    if (attachments.length > 0) {
      return (
        <div className="image-holder">
          {(attachments || []).map((file, idx) => {
            let src = window.URL.createObjectURL(file)
            return (
              <div key={idx} className="image-to-attach">
                <img
                  src={src}
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
            )
          })}
        </div>
      )
    }

    return null
  }

  const inputHandler = (e) => {
    const { value } = e.target
    setMessageText(value)
  }

  const calcHeight = (value) => {
    let numberOfLineBreaks = (value.match(/\n/g) || []).length
    let newHeight = 20 + numberOfLineBreaks * 20 + 12 + 2
    return newHeight
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

  const dropHandler = (e) => {
    e.preventDefault()
    const { files } = e.dataTransfer
    addAttachment(files[0])
  }

  const addAttachment = (file) => {
    setAttachments([...attachments, file])
  }

  const triggerPicker = (event) => {
    event.preventDefault()
    setEmojiPicker(!emojiPickerState)
  }

  const EmojiPicker = () => {
    if (emojiPickerState) {
      return (
        <Picker
          className={`attach-emoji ${styles.emojiPicker}`}
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

  const addEmoji = (e) => {
    let msg = messageText + e.native
    setMessageText(msg)
    setEmojiPicker(!emojiPickerState)
  }

  const openFileSelector = () => {
    fileRef.current.click()
  }

  const MessageSubmits = () => {
    const isDisabled =
      messageText.trim().length === 0 && attachments.length == 0

    return (
      <div id={styles.ChatInputControlsRight}>
        <button
          className={styles.SendMessage}
          disabled={isDisabled}
          onClick={() => {
            sendMessagge()
          }}
        >
          send
        </button>
      </div>
    )
  }

  const sendMessagge = () => {
    let message = {
      value: messageText,
      attachments: attachments,
    }
    onSubmitHandler(message)
    resetInput()
  }

  const resetInput = () => {
    setMessageText('')
    setAttachments([])
    setEmojiPicker(null)
  }

  return (
    <div id={styles.ChatInput}>
      <ImageHolder />
      <textarea
        id={styles.ChatInputText}
        ref={textRef}
        onChange={inputHandler}
        value={messageText}
        onKeyDown={(e) => {
          let input = messageText
          if (e.altKey) {
            setAltKey(true)
          }
          if (e.key == 'Enter' && altKey) {
            input = input + '\r\n'
            setMessageText(input)
            textRef.current.style.height =
              calcHeight(textRef.current.value) + 'px'
          } else if (e.key === 'Enter' && input.trim().length > 0) {
            sendMessagge()
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

export default GeneralChatInput
