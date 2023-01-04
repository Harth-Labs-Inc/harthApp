import { useForm } from "react-hook-form";
import React, { useEffect, useState } from "react";
import ErrorMessage from "../../../Common/Input/ErrorMessage";
import { Button, Modal } from "../../../Common";
import { useComms } from "../../../../contexts/comms";
import { useAuth } from "../../../../contexts/auth";
import { useSocket } from "../../../../contexts/socket";
import { saveTopics } from "../../../../requests/community";
import { addRoomToUsers } from "../../../../requests/rooms";

import styles from "./CreateNewConversationModal.module.scss";


export default function CreateNewConversationModal({ toggleModal }) {
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
      <div className={styles.mainContainer}>
      <div className={styles.title}>New conversation</div>

          <p className={styles.CreateTopicTimeText}>
            need update
          </p>
          
          <div className={styles.CreateTopicButtons}>
            <Button
              size="large"
              tier="secondary"
              text="cancel"
              onClick={toggleModal}
            />
          </div>
      </div>
    </Modal>
  );
}
