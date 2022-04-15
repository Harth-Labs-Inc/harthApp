import { useEffect } from 'react'
import styles from './TurnKeeper.module.scss'

const PeerTurn = ({ openTurnKeeper }) => {
  useEffect(() => {
    const exisitingIcon = document.getElementById('turn-keeper-icon')
    if (exisitingIcon) {
      exisitingIcon.remove()
    }
    if (openTurnKeeper && openTurnKeeper.length) {
      openTurnKeeper.forEach((peer) => {
        if (peer.activeTurnUser) {
          const videoContainer = document.getElementById(
            `parent-${peer.peerId}`,
          )
          const icon = document.createElement('span')

          icon.id = 'turn-keeper-icon'
          icon.classList.add(`${styles.PeerTurn}`)

          if (videoContainer) {
            videoContainer.appendChild(icon)
          }
        }
      })
    }
  }, [openTurnKeeper])

  return null
}

export default PeerTurn
