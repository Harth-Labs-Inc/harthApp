import { BackButton } from '../../Common/Buttons/BackButton'

import styles from './TopicEditMenu.module.scss'

const TopicEditForm = (props) => {
  const { closeEditForm } = props
  return (
    <form id={styles.TopicEditForm}>
      <div className={styles.TopicEditFormHeader}>
        <BackButton onClick={closeEditForm} ariaLabel="back to topic menu" />
        <span>Edit Topic</span>
      </div>
      <label>
        Name <input type="text" />
      </label>
      <label>
        description <textarea type="text" />
      </label>
    </form>
  )
}

export default TopicEditForm
