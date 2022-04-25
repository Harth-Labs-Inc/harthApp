import { IconButton } from '../../../../components/Common/Buttons/IconButton'

import styles from './VoiceFooter.module.scss'

const VoiceFooter = ({ leaveRoom, toggleAudio, muteOn }) => {
  return (
    <div className={styles.voiceGatheringFooter}>
      <IconButton onClick={leaveRoom} className={styles.voiceGatheringLeave}>
        Leave
      </IconButton>
      <IconButton
        onClick={toggleAudio}
        className={`${styles.voiceGatheringMute} ${
          muteOn ? styles.voiceGatheringMuted : styles.voiceGatheringNotMuted
        }`}
      >
        {muteOn ? 'MUTE' : 'UNMUTE'}
      </IconButton>
    </div>
  )
}

export default VoiceFooter
