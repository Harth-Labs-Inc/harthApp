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
  const { selectedcomm } = useComms();
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
      <form
        className={styles.CreateTopic}
        onSubmit={handleSubmit(createNewTopic)}
      >
        <input
          {...register("topicName", { required: true })}
          placeholder="Topic name"
          type="text"
        />
        <ErrorMessage
          errorMsg={
            errors.topicName ? "You must set a Topic name to begin." : null
          }
        />
        <p className={styles.CreateTopicTimeText}>
          Keep content posted to this topic for:
        </p>
        <div className={styles.CreateTopicTime}>
          <label
            className={`${styles.CreateTopicTimeButton} ${
              watchAge === "long" ? styles.Active : null
            }`}
            htmlFor="field-long"
          >
            <input
              {...register("contentAge", { required: true })}
              type="radio"
              value="long"
              id="field-long"
            />
            <IconBookmarkNoFill />
            90 days
          </label>
          <label
            className={`${styles.CreateTopicTimeButton} ${
              watchAge === "short" ? styles.Active : null
            }`}
            htmlFor="field-short"
          >
            <input
              {...register("contentAge")}
              type="radio"
              value="short"
              id="field-short"
            />
            <IconTimerNoFill />
            24 hours
          </label>
        </div>
        <ErrorMessage
          errorMsg={errors.contentAge ? "You must set contents age" : null}
        />
        <div className={styles.CreateTopicButtons}>
          <Button
            size="small"
            tier="secondary"
            text="Cancel"
            onClick={toggleModal}
          />
          <Button fullWidth size="small" text="Create Topic" type="submit" />
        </div>
      </form>
    </Modal>
  );
}
