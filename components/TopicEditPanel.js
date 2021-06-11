import { useComms } from '../contexts/comms'

import { CloseBtn } from '../components/Common/Button'
import ToggleSwitch from '../components/Common/Toggle'

export default function TopicEditPanel() {
  const { selectedTopic } = useComms()

  console.log(selectedTopic)

  const TopicState = () => {
    if (selectedTopic.private === true) {
      return 'Private'
    } else {
      return 'Public'
    }
  }

  return (
    <section id="topic_settings">
      <header>
        <h2>
          {(selectedTopic || {}).title} <CloseBtn />
        </h2>
        <span>
          <TopicState />
        </span>
      </header>
      <p id="topic_settings_container">{selectedTopic.description}</p>
      <ToggleSwitch />
    </section>
  )
}
