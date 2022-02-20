import { BackButton, Button, Input, TextArea } from '../../Common'

import styles from './TopicEditMenu.module.scss'

const TopicEditForm = (props) => {
  const { closeEditForm } = props
  return (
    <div className={styles.TopicEdit}>
      <div className={styles.TopicEditHeader}>
        <BackButton onClick={closeEditForm} ariaLabel="back to topic menu" />
        <span>Edit Topic</span>
      </div>
      <form id={styles.TopicEditForm}>
        <Input title="Name" placeholder="Topic Name" />
        <TextArea title="Description" placeholder="Topic Description" />
        <Button fullWidth={true} disabled={true} text="Update" />
      </form>
    </div>
  )
}

export default TopicEditForm
