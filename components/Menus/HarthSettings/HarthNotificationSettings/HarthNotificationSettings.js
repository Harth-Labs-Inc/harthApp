import { Toggle } from "../../../Common/Toggle/Toggle";
import { useComms } from "../../../../contexts/comms";
import { useAuth } from "../../../../contexts/auth";

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
      <div>
        <span>Chat</span>
        <div style={{ width: "max-content" }}>
          <Toggle
            onToggleChange={muteHarthHandler}
            toggleName="chat"
            isChecked={isHarthMuted}
          ></Toggle>
        </div>
      </div>
      {topics.map((topic) => {
        let userIndex = topic.members.findIndex(({ user_id }) => {
          return user_id == user._id;
        });

        let profile;
        let isMuted;

        if (userIndex >= 0) {
          profile = topic.members[userIndex];
          isMuted = profile?.muted;
        }

        return (
          <div>
            <span>{topic?.title}</span>
            <div style={{ width: "max-content" }}>
              <Toggle
                onToggleChange={() => muteTopicHandler(topic)}
                toggleName="chat"
                isChecked={isMuted}
              ></Toggle>
            </div>
          </div>
        );
      })}
    </>
  );
};

export default HarthNotificationSettings;
