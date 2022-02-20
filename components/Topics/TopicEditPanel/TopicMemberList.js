import { BackButton } from '../../Common/Buttons/BackButton'

import UserIcon from '../../userIcon'
import styles from './TopicEditMenu.module.scss'

const TopicMemberList = (props) => {
  const { memberList, closeMemberList } = props
  console.log(memberList)
  return (
    <div className={styles.topicMembers}>
      <div className={styles.topicMembersHeader}>
        <BackButton onClick={closeMemberList} textLabel="back to topic menu" />
        <span>Members</span>
      </div>
      <ul>
        {memberList.filter(Boolean).map((member) => (
          <li key={member?.user_id}>
            <UserIcon
              id={member?.user_id}
              img={member?.iconKey}
              name={member?.name || member?.fullName}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}

export default TopicMemberList
