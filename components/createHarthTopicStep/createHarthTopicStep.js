import { useState } from "react";
import { useAuth } from "../../contexts/auth";
import { useComms } from "../../contexts/comms";
import TalkingHead from "../TalkingHead/TalkingHead";
import { Button, Modal } from "../Common";
import ErrorMessage from "../Common/Input/ErrorMessage";
import styles from "./createHarthTopicStep.module.scss";
import { useSocket } from "contexts/socket";
import { useForm } from "react-hook-form";
import { IconArrowLeft } from "resources/icons/IconArrowLeft";
import { EmojiWrapper } from "components/EmojiWrapper/EmojiWrapper";
import { saveTopics } from "../../requests/community";
import { addRoomToUsers } from "../../requests/rooms";

export default function CreateHarthTopicStep({ closeHandler, ignoreFadeIn }) {
  const [emojiPickerState, setEmojiPicker] = useState(false);
  const [Emoji, setEmoji] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const { user } = useAuth();
  const { selectedcomm, setSelectedTopic } = useComms();
  const { emitUpdate } = useSocket();

  const createNewTopic = async (data) => {
    setIsLoading(true);
    let topic,
      userIds = [];

    selectedcomm.users.forEach((usr) => {
      userIds.push(usr.userId);
    });
    topic = {
      comm_id: selectedcomm._id,
      members: [
        {
          user_id: user._id,
          admin: true,
          muted: false,
          hidden: false,
        },
        ...((selectedcomm || {}).users || []).map((usr) => {
          if (usr.userId !== user._id) {
            return {
              ...usr,
              user_id: usr.userId,
              admin: false,
              muted: false,
              hidden: false,
            };
          }
        }),
      ].filter(Boolean),
      topic_creator_id: user._id,
      title: data.topicName,
      invites: [],
      contentAge: data.contentAge,
      private: false,
      marker: Emoji || "",
    };
    const saveResults = await saveTopics(topic);
    const { ok, id } = saveResults;
    if (ok) {
      topic._id = id;

      if (id) {
        await addRoomToUsers(userIds, id);
        setSelectedTopic(topic);
        topic.updateType = "new topic";
        emitUpdate(selectedcomm._id, topic, async (err) => {
          if (err) {
            console.error(err);
          }
          setTimeout(() => {
            togglemodal();
          }, 300);
        });
      }
    }
    setIsLoading(false);
  };
  const toggleEmojiPicker = () => {
    setEmojiPicker((prevState) => !prevState);
  };
  const addEmoji = (e) => {
    setEmoji(e.native);
    setEmojiPicker(false);
  };
  const EmojiPicker = () => {
    if (emojiPickerState) {
      return (
        <div
          className={styles.EmojiPicker}
          style={{ height: "var(--vh)", width: "100vw" }}
        >
          <EmojiWrapper
            addEmoji={addEmoji}
            closeWrapper={() => {
              console.log("clicked");
              setEmojiPicker(false);
            }}
          ></EmojiWrapper>
        </div>
      );
    }
  };
  const togglemodal = () => {
    closeHandler();
  };

  return (
    <>
      <Modal onToggleModal={togglemodal} ignoreFadeIn={ignoreFadeIn}>
        <div className={styles.mainContainer}>
          <div className={styles.title}>
            Create a topic
          </div>
          <div className={styles.lineParent}>
            <div className={`${styles.line} ${styles.lineActive}`}></div>
            <div className={`${styles.line} ${styles.lineActive}`}></div>
            <div className={`${styles.line} ${styles.lineActive}`}></div>
          </div>
          <TalkingHead
            text={
              "Give me a topic that you and your friends like to talk about"
            }
          />

          <form
            className={styles.CreateTopic}
            onSubmit={handleSubmit(createNewTopic)}
          >
            <div className={styles.inputHolder}>
              <button type="button" onClick={toggleEmojiPicker}>
                {Emoji ? (
                  <p className={styles.TopicEmoji}>{Emoji}</p>
                ) : (
                  <p className={styles.TopicEmoji}>&#x1F600;</p>
                )}
              </button>

              <input
                {...register("topicName", { required: true })}
                placeholder="games, memes, food, ect..."
                type="text"
                autoComplete="off"
              />
            </div>
            <div className={styles.error}>
              <ErrorMessage
                errorMsg={errors.topicName ? "You must name your topic" : null}
              />
            </div>
            <div className={styles.reminder}>
              <div className={styles.icon}>
                <IconArrowLeft />
              </div>
              <span className={styles.text}>
                Don&rsquo;t forget to add an emoji!
              </span>
            </div>
            <div className={styles.helpText}>
              You can always edit or add more topics later.
            </div>
            <div className={styles.buttonBar}>
              <Button
                size="large"
                text="Skip"
                tier="secondary"
                onClick={togglemodal}
                className={styles.backButton}
              />

              <Button
                fullWidth
                size="large"
                text="Add"
                type="submit"
                isLoading={isLoading}
                className={styles.submitButton}
              />
            </div>
          </form>
        </div>
      </Modal>
      <EmojiPicker />
    </>
  );
}
