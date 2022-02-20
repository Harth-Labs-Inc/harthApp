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
            <UserIcon
              id={member?.user_id}
              img={member?.iconKey}
              name={member?.name || member?.fullName}
              data={{ member, index }}
              clickHandler={clickHandler}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}

export default TopicMemberList
