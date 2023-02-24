import { useForm } from "react-hook-form";
import React, { useEffect, useState } from "react";
import ErrorMessage from "../../../Common/Input/ErrorMessage";
import { Button, Modal } from "../../../Common";
import { useComms } from "../../../../contexts/comms";
import { useAuth } from "../../../../contexts/auth";
import { useSocket } from "../../../../contexts/socket";

import { saveTopics } from "../../../../requests/community";
import { addRoomToUsers } from "../../../../requests/rooms";

import styles from "./CreateNewTopicModal.module.scss";
import { IconBookmarkNoFill } from "../../../../resources/icons/IconBookmarkNoFill";
import { IconTimerNoFill } from "../../../../resources/icons/IconTimerNoFill";

export default function CreateNewTopicModal({ toggleModal }) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const { user } = useAuth();
  const { selectedcomm, setTopic, selectedTopic } = useComms();
  const { emitUpdate } = useSocket();

  const watchAge = watch("contentAge", "long");

  const createNewTopic = async (data) => {
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
        const results = await addRoomToUsers(userIds, id);
        topic.updateType = "new topic";
        emitUpdate(selectedcomm._id, topic, async (err, status) => {
          if (err) {
            console.log(err);
          }
          let { ok } = status;
        });
      }
    }
  };

  return (
    <Modal onToggleModal={toggleModal}>
      <div className={styles.mainContainer}>
        <div className={styles.title}>New topic</div>
        <form
          className={styles.CreateTopic}
          onSubmit={handleSubmit(createNewTopic)}
        >
          <div className={styles.inputHolder}>
            <button>
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Twemoji_1f600.svg/1024px-Twemoji_1f600.svg.png"
                loading="lazy"
              />
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
              errorMsg={errors.topicName ? "You must set a topic name" : null}
            />
          </div>

          <div className={styles.subtext}>
            Content in this topic will be kept for 90 days
          </div>
          <div className={styles.CreateTopicButtons}>
            <Button
              size="large"
              tier="secondary"
              text="Cancel"
              onClick={toggleModal}
            />
            <Button fullWidth size="large" text="Create Topic" type="submit" />
          </div>
        </form>
      </div>
    </Modal>
  );
}
