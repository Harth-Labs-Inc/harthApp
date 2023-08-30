import { Toggle } from "../../../Common/Toggle/Toggle";
import { useComms } from "../../../../contexts/comms";
import { useAuth } from "../../../../contexts/auth";

import styles from "./harthnotificationsettings.module.scss";
import { useEffect, useState } from "react";
import { getTopics } from "requests/community";
import { getConversations } from "requests/conversations";

const HarthNotificationSettings = () => {
  const {
    selectedcomm,
    updateSelectedHarth,
    updateSelectedTopic,
    updateSelectedConv,
  } = useComms();
  const { user } = useAuth();

  const [TopicsArr, setTopicsArr] = useState([]);
  const [ConvArr, setConvArr] = useState([]);

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
  const muteConvHandler = async (conv) => {
    await updateSelectedConv({
      newconv: {
        ...conv,
        users: [
          ...(conv.users || []).map((usr) => {
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
        OriginalUsers: [
          ...(conv.OriginalUsers || []).map((usr) => {
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

  const getNotificationData = async () => {
    try {
      const [topicResult, convResult] = await Promise.all([
        getTopics(selectedcomm._id, user._id),
        getConversations(selectedcomm._id, user._id),
      ]);

      const { ok: topOk, topics } = topicResult;
      const { ok: convOk, conversations } = convResult;

      if (topOk) {
        setTopicsArr(topics);
      }

      if (convOk) {
        setConvArr(conversations);
      }
    } catch (error) {
      console.error("Error fetching notification data:", error);
    }
  };

  useEffect(() => {
    getNotificationData();
  }, []);

  let isHarthMuted = false;
  let profile;

  if (selectedcomm && user) {
    let userIndex = selectedcomm.users.findIndex((usr) => {
      return usr.userId == user._id;
    });

    if (userIndex >= 0) {
      profile = selectedcomm.users[userIndex];
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
            isChecked={!isHarthMuted}
          />
        </div>

        <div className={styles.chatListHolder}>
          {TopicsArr?.map((topic, idx) => {
            let userIndex = topic.members.findIndex(({ user_id }) => {
              return user_id == user._id;
            });

            let profile;
            let isMuted;

            if (userIndex >= 0) {
              profile = topic.members[userIndex];
              isMuted = profile?.muted;
            }

            if (isHarthMuted) {
              isMuted = true;
            }

            return (
              <div
                className={styles.individualRow}
                key={`${topic?.title}_${idx}`}
              >
                <p>{topic?.title}</p>
                <Toggle
                  onToggleChange={() => muteTopicHandler(topic)}
                  toggleName="chat"
                  isChecked={!isMuted}
                ></Toggle>
              </div>
            );
          })}
        </div>

        <div className={styles.sectionRow}>
          <p>Gather</p>
          {/* <Toggle /> */}
        </div>

        <div className={styles.sectionRow}>
          <p>Messages</p>
          {/* <Toggle /> */}
        </div>
        <div className={styles.chatListHolder}>
          {ConvArr?.map((conv) => {
            let userIndex = conv.users.findIndex(({ userId }) => {
              return userId == user._id;
            });

            let profile;
            let isMuted;

            if (userIndex >= 0) {
              profile = conv.users[userIndex];
              isMuted = profile?.muted;
            }

            if (isHarthMuted) {
              isMuted = true;
            }
            return (
              <div className={styles.individualConvRow} key={`${conv._id}`}>
                <div style={{ padding: "3px 0" }}>
                  {conv.OriginalUsers
                    ? conv.OriginalUsers?.map((e) => {
                        if (e.userId !== profile.userId) {
                          let creator = selectedcomm.users?.find(
                            (usr) => usr.userId === e.userId
                          );
                          return (
                            <div
                              key={e.userId}
                              className={styles.participantElement}
                            >
                              <img
                                className={`
                                  ${styles.avatar} 
                                  ${selectedcomm?._id}_${e.userId}
                                  `}
                                src={creator?.iconKey}
                                loading="eager"
                              />
                              <div
                                className={[
                                  styles.label,
                                  `${selectedcomm._id}_${e.userId}_name`,
                                ].join(" ")}
                              >
                                {creator?.name}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })
                    : conv.users?.map((e) => {
                        let creator = selectedcomm.users?.find(
                          (usr) => usr.userId === e.userId
                        );
                        if (e.userId == profile?.userId) {
                          return (
                            <div
                              key={e.userId}
                              className={styles.participantElement}
                            >
                              <img
                                className={`
                                            ${styles.avatar}
                                            ${selectedcomm?._id}_${profile?.userId}
                                            `}
                                src={creator?.iconKey}
                                loading="eager"
                              />
                              <div
                                className={[
                                  styles.label,
                                  `${selectedcomm._id}_${profile?.userId}_name`,
                                ]}
                              >
                                {creator?.name}
                              </div>
                            </div>
                          );
                        }
                        return (
                          <div
                            key={e.userId}
                            className={styles.participantElement}
                          >
                            <img
                              className={`
                                ${styles.avatar} 
                                ${selectedcomm?._id}_${e.userId}
                                `}
                              src={creator?.iconKey}
                              loading="eager"
                            />
                            <div
                              className={[
                                styles.label,
                                `${selectedcomm._id}_${e.userId}_name`,
                              ].join(" ")}
                            >
                              {creator?.name}
                            </div>
                          </div>
                        );
                      })}
                </div>
                <Toggle
                  onToggleChange={() => muteConvHandler(conv)}
                  toggleName="chat"
                  isChecked={!isMuted}
                ></Toggle>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default HarthNotificationSettings;
