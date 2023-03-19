import { useAuth } from "../../../contexts/auth";
import { useComms } from "../../../contexts/comms";
import { BackButton } from "../../Common";

import UserIcon from "../../UserIcon/userIcon";
import styles from "./TopicEditMenu.module.scss";

const TopicMemberList = (props) => {
    const { memberList, closeMemberList, clickHandler, listType } = props;

    const { selectedcomm } = useComms;
    const { user } = useAuth;

    const TitleText = () => {
        if (listType === "list") {
            return <span>Members</span>;
        } else if (listType === "add") {
            return <span>Add People</span>;
        }
    };

    return (
        <div className={styles.topicMembers}>
            <div className={styles.topicMembersHeader}>
                <BackButton
                    onClick={closeMemberList}
                    textLabel="back to topic menu"
                />
                <TitleText />
            </div>
            <ul className={styles.topicMembersList}>
                {memberList.filter(Boolean).map((member, index) => (
                    <li
                        key={member?.name}
                        className={styles.topicMembersListItem}
                    >
                        <UserIcon
                            id={member?.user_id}
                            img={member?.iconKey}
                            name={member?.name || member?.fullName}
                            iconClass={`${selectedcomm?._id}_${user?._id}`}
                        />
                        {clickHandler ? (
                            <button
                                className={styles.topicMembersListItemButton}
                                onClick={clickHandler}
                            >
                                add member
                            </button>
                        ) : null}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TopicMemberList;
