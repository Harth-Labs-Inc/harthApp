import { useForm } from "react-hook-form";
import { useState } from "react";
import ErrorMessage from "../../../Common/Input/ErrorMessage";
import { Button, Modal } from "../../../Common";
import { useComms } from "../../../../contexts/comms";
import { useAuth } from "../../../../contexts/auth";
import { useSocket } from "../../../../contexts/socket";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";

import { saveTopics } from "../../../../requests/community";
import { addRoomToUsers } from "../../../../requests/rooms";

import OutsideClickHandler from "components/Common/Modals/OutsideClick";

import styles from "./CreateNewTopicModal.module.scss";

export default function CreateNewTopicModal({ toggleModal }) {
    const [emojiPickerState, setEmojiPicker] = useState(false);
    const [Emoji, setEmoji] = useState();
    const [isLoading, setIsLoading] = useState(false);
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const { user } = useAuth();
    const { selectedcomm, setTopic, selectedTopic } = useComms();
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
            toggleModal();
            if (!selectedTopic?._id) {
                setTopic(topic);
            }
            if (id) {
                await addRoomToUsers(userIds, id);
                topic.updateType = "new topic";
                emitUpdate(selectedcomm._id, topic, async (err) => {
                    if (err) {
                        console.error(err);
                    }
                    // let { ok } = status;
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
                <div className={styles.EmojiPicker}>
                    <OutsideClickHandler
                        onClickOutside={() => {
                            if (emojiPickerState) setEmojiPicker(false);
                        }}
                        onFocusOutside={() => {
                            if (emojiPickerState) setEmojiPicker(false);
                        }}
                    >
                        <Picker
                        
                            data={data}
                            className="attach-emoji"
                            onEmojiSelect={addEmoji}
                            autoFocus={true}
                            emojiButtonSize={32}
                            emojiSize={20}
                            perLine={8}
                            previewPosition="none"
                            navPosition="none"
                            emojiButtonColors={[
                                "rgba(187,126,196,0.8)",
                                "rgba(13,161,181,0.8)",
                                "rgba(240,101,115,0.8)",
                                "rgba(0,163,150,0.8)",
                            ]}

                        />
                    </OutsideClickHandler>
                </div>
            );
        }
    };

    return (
        <Modal
            onToggleModal={toggleModal}
            classNames={styles.CreateNewTopicModal}
        >
            <div className={styles.mainContainer}>
                <EmojiPicker />
                <div className={styles.title}>New topic</div>
                <form
                    className={styles.CreateTopic}
                    onSubmit={handleSubmit(createNewTopic)}
                >
                    <div className={styles.inputHolder}>
                        <button type="button" onClick={toggleEmojiPicker}>
                            {Emoji ? (
                                <p className={styles.TopicEmoji}>{Emoji}</p>
                            ) : (
                                <p className={styles.TopicEmoji}>😀</p>
                            )}
                        </button>

                        <input
                            {...register("topicName", { required: true })}
                            placeholder="Topic name"
                            type="text"
                            autoComplete="off"
                        />
                    </div>
                    <div className={styles.error}>
                        <ErrorMessage
                            errorMsg={
                                errors.topicName
                                    ? "You must set a topic name"
                                    : null
                            }
                        />
                    </div>

                    {/* <div className={styles.subtext}>
                        Content in this topic will be kept for 90 days
                    </div> */}
                    <div className={styles.CreateTopicButtons}>
                        <Button
                            size="large"
                            tier="secondary"
                            text="Cancel"
                            onClick={toggleModal}
                        />
                        <Button
                            fullWidth
                            size="large"
                            text="Create Topic"
                            type="submit"
                            isLoading={isLoading}
                        />
                    </div>
                </form>
            </div>
        </Modal>
    );
}
