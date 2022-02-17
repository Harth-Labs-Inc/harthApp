import ReactCSSTransitionGroup from 'react-transition-group'
import { useComms } from '../../../contexts/comms'

import { CloseBtn } from '../../Common/Button'
import ToggleSwitch from '../../Common/Toggle/Toggle'

import styles from './TopicEditMenu.module.scss'

export default function TopicEditPanel(props) {
  const { togglePanel } = props
  const { selectedTopic } = useComms()

  console.log('selected topic', selectedTopic)

  const TopicState = () => {
    if (selectedTopic.private === true) {
      return 'Private'
    } else {
      return 'Public'
    }
  }

  return (
    <section className={styles.topicSettings}>
      <header>
        <div className={styles.topicSettingsHeader}>
          <span>
            <p className={styles.topicSettingsHeaderTitle}>
              {(selectedTopic || {}).title}
            </p>
            <TopicState />
          </span>{' '}
          <CloseBtn onClick={togglePanel} />
        </div>
      </header>
      <p className={styles.topicSettingsDescription}>
        {selectedTopic.description}
      </p>
      <div className={styles.topicSettingsMute}>
        <ToggleSwitch />
        Mute
      </div>

      <ul className={styles.topicSettingsControls}>
        <li>
          <button className={styles.topicSettingsButton}>
            Members({selectedTopic?.members?.length})
          </button>
        </li>
        <li>
          <button className={styles.topicSettingsButton}>Add People</button>
        </li>
        <li>
          <button className={styles.topicSettingsButton}>Edit</button>
        </li>
        <li>
          <button className={styles.topicSettingsButton}>Delete</button>
        </li>
        <li>
          <button className={styles.topicSettingsButton}>Leave</button>
        </li>
      </ul>
    </section>
  )
}
