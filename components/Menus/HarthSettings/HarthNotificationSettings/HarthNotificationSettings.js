import { Toggle } from "../../../Common/Toggle/Toggle";
import { useComms } from "../../../../contexts/comms";
import { useAuth } from "../../../../contexts/auth";

import styles from "./harthnotificationsettings.module.scss";

const HarthNotificationSettings = () => {
    const { selectedcomm, updateSelectedHarth, topics, updateSelectedTopic } =
        useComms();
    const { user } = useAuth();

    const muteHarthHandler = async () => {
        await updateSelectedHarth({
            newHarth: {
                ...selectedcomm,
                users: [
                    ...(selectedcomm.users || []).map((usr) => {
                        if (usr.userId == user._id) {
                            return {
                                ...usr,
                                muted: !usr.muted,
                            };
                        } else {
                            return usr;
                        }
                    }),
                ],
            },
        });
    };
    const muteTopicHandler = async (topic) => {
        await updateSelectedTopic({
            newTopic: {
                ...topic,
                members: [
                    ...(topic.members || []).map((usr) => {
                        if (usr.user_id == user._id) {
                            return {
                                ...usr,
                                muted: !usr.muted,
                            };
                        } else {
                            return usr;
                        }
                    }),
                ],
            },
        });
    };

    let isHarthMuted = false;

    if (selectedcomm && user) {
        let userIndex = selectedcomm.users.findIndex((usr) => {
            return usr.userId == user._id;
        });

        if (userIndex >= 0) {
            let profile = selectedcomm.users[userIndex];
            isHarthMuted = profile?.muted;
        }
    }

    return (
        <>
            <div className={styles.listHolder}>
                <div className={styles.sectionRow}>
                    <p>Chat</p>
                    <Toggle
                        onToggleChange={muteHarthHandler}
                        toggleName="chat"
                        isChecked={isHarthMuted}
                    />
                </div>

                <div className={styles.chatListHolder}>
                    {topics?.map((topic, idx) => {
                        let userIndex = topic.members.findIndex(
                            ({ user_id }) => {
                                return user_id == user._id;
                            }
                        );

                        let profile;
                        let isMuted;

                        if (userIndex >= 0) {
                            profile = topic.members[userIndex];
                            isMuted = profile?.muted;
                        }

                        return (
                            <div
                                className={styles.individualRow}
                                key={`${topic?.title}_${idx}`}
                            >
                                <p>{topic?.title}</p>
                                <Toggle
                                    onToggleChange={() =>
                                        muteTopicHandler(topic)
                                    }
                                    toggleName="chat"
                                    isChecked={!isMuted}
                                ></Toggle>
                            </div>
                        );
                    })}
                </div>

                <div className={styles.sectionRow}>
                    <p>Gather</p>
                    <Toggle
                    //onToggleChange={muteHarthHandler}
                    //toggleName="chat"
                    //isChecked={!isHarthMuted}
                    />
                </div>

                <div className={styles.sectionRow}>
                    <p>Messages</p>
                    <Toggle
                    //onToggleChange={muteHarthHandler}
                    //toggleName="chat"
                    //isChecked={!isHarthMuted}
                    />
                </div>
            </div>
        </>
    );
};

export default HarthNotificationSettings;
