import { useState } from "react";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import OutsideClickHandler from "components/Common/Modals/OutsideClick";
import { Button } from "Common";

import styles from "./TopicEditModal.module.scss";
import { useForm } from "react-hook-form";
import ErrorMessage from "../Common/Input/ErrorMessage";

const TopicEditModal = ({ setHidden, topic, submitTopicChange }) => {
    const [emojiPickerState, setEmojiPicker] = useState(false);
    const [Emoji, setEmoji] = useState(topic.marker);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({ defaultValues: { topicName: topic.title } });

    const submitHandler = async (data) => {
        let newTopic = { ...topic };
        if (data.topicName) {
            newTopic.title = data.topicName;
        }
        if (Emoji) {
            newTopic.marker = Emoji;
        }

        submitTopicChange(newTopic);
    };
    const handleCancel = () => {
        setHidden();
    };
    const toggleEmojiPicker = () => {
        setEmojiPicker((prevState) => !prevState);
    };
    const addEmoji = (e) => {
        setEmoji(e.native);
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
        <div className={styles.mainContainer}>
            <div className={styles.title}>Rename topic</div>
            <form
                onSubmit={handleSubmit(submitHandler)}
                className={styles.CreateTopic}
            >
                <div className={styles.inputHolder}>
                    <button type="button" onClick={toggleEmojiPicker}>
                        <EmojiPicker />
                        {Emoji ? (
                            <p style={{ fontSize: "28px" }}>{Emoji}</p>
                        ) : (
                            <p style={{ fontSize: "28px" }}>&#x1F600;</p>
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

                <div className={styles.CreateTopicButtons}>
                    <Button
                        size="large"
                        tier="secondary"
                        text="Cancel"
                        onClick={handleCancel}
                    />
                    <Button
                        fullWidth
                        size="large"
                        text="Rename"
                        type="submit"
                    />
                </div>
            </form>
        </div>
    );
};

export default TopicEditModal;
