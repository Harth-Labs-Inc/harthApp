import { useEffect, useState } from 'react'
import { BackButton, Button, Input, TextArea } from '../../Common'

import styles from './TopicEditMenu.module.scss'

const TopicEditForm = (props) => {
  const { closeEditForm, editSubmitHandler } = props

  const [Name, setName] = useState('')
  const [Description, setDescription] = useState('')
  const [disabled, setDisabled] = useState(true)

  useEffect(() => {
    if (Name.trim().length && Description.trim().length) {
      setDisabled(false)
    } else {
      setDisabled(true)
    }
  }, [Name, Description])

  const nameChangeHandler = (e) => {
    const { value } = e.target
    setName(value)
  }
  const descriptionChangeHandler = (e) => {
    const { value } = e.target
    setDescription(value)
  }

  const submitHandler = (e) => {
    e.preventDefault()
    editSubmitHandler({ title: Name, description: Description })
  }

  return (
    <div className={styles.TopicEdit}>
      <div className={styles.TopicEditHeader}>
        <BackButton onClick={closeEditForm} ariaLabel="back to topic menu" />
        <span>Edit Topic</span>
      </div>
      <form id={styles.TopicEditForm} onSubmit={submitHandler}>
        <Input
          title="Name"
          name="Name"
          placeholder="Topic Name"
          onChange={nameChangeHandler}
        />
        <TextArea
          title="Description"
          name="Description"
          placeholder="Topic Description"
          onChange={descriptionChangeHandler}
        />
        <Button fullWidth={true} disabled={disabled} text="Update" />
      </form>
    </div>
  )
}

export default TopicEditForm
