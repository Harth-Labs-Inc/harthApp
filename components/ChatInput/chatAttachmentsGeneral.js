import { useEffect, useRef, useState, useCallback } from 'react'

const DEFAULT_OPTIONS = {
  config: { attributes: true, childList: true, subtree: true },
}
function useMutationObservable(targetEl, cb, options = DEFAULT_OPTIONS) {
  const [observer, setObserver] = useState(null)

  useEffect(() => {
    const obs = new MutationObserver(cb)
    setObserver(obs)
  }, [cb, options, setObserver])

  useEffect(() => {
    if (!observer) return
    const { config } = options
    observer.observe(targetEl, config)
    return () => {
      if (observer) {
        observer.disconnect()
      }
    }
  }, [observer, targetEl, options])
}

export default function ChatAttachment({ attachments }) {
  const listRef = useRef()
  const [count, setCount] = useState(2)
  const [images, setImages] = useState([])
  const onListMutation = useCallback(
    (mutationList) => {
      console.log('item added')
      setCount(mutationList[0].target.children.length)
    },
    [setCount],
  )

  useEffect(() => {
    console.log('new list item added', listRef.current)
  }, [count])

  useEffect(() => {
    if (attachments) {
      attachments.forEach((att) => {
        var arrayBufferView = new Uint8Array(att)
        var blob = new Blob([arrayBufferView], { type: 'image/jpeg' })
        var urlCreator = window.URL || window.webkitURL
        var imageUrl = urlCreator.createObjectURL(blob)
        setImages([...images, imageUrl])
      })
    }
  }, [attachments])

  useMutationObservable(listRef.current, onListMutation)

  return (
    <ul ref={listRef}>
      {images.map((f) => {
        console.log(f)
        return (
          <li key={f}>
            <img src={f} />
          </li>
        )
      })}
    </ul>
  )
}
