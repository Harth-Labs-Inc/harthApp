import { BackButton } from '../../Common'

import UserIcon from '../../UserIcon/userIcon'
import styles from './TopicEditMenu.module.scss'

const TopicMemberList = (props) => {
  const { memberList, closeMemberList, clickHandler } = props
  console.log(memberList)
  return (
    <div className={styles.topicMembers}>
      <div className={styles.topicMembersHeader}>
        <BackButton onClick={closeMemberList} textLabel="back to topic menu" />
        <span>Members</span>
      </div>
      <ul className={styles.topicMembersList}>
        {memberList.filter(Boolean).map((member, index) => (
          <li key={member?.name} className={styles.topicMembersListItem}>
            <button onClick={clickHandler}>
              <UserIcon
                id={member?.user_id}
                img={member?.iconKey}
                name={member?.name || member?.fullName}
              />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default TopicMemberList
