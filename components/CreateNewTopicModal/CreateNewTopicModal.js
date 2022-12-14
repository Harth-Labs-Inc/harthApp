import { useForm } from "react-hook-form";
import React, { useEffect, useState } from "react";
import ErrorMessage from "../Common/Input/ErrorMessage";
import { Button, Modal } from "../Common";
import { useComms } from "../../contexts/comms";
import { useAuth } from "../../contexts/auth";
import { useSocket } from "../../contexts/socket";

import { saveTopics } from "../../requests/community";
import { addRoomToUsers } from "../../requests/rooms";

export default function CreateNewTopicModal({ toggleModal }) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const { user } = useAuth();
    const { selectedcomm } = useComms();
    const { emitUpdate } = useSocket();

    const createNewTopic = async (data) => {
        let topic,
            userIds = [];

        selectedcomm.users.forEach((usr) => {
            userIds.push(usr.userId);
        });
        topic = {
            comm_id: selectedcomm._id,
            members: [
                { user_id: user._id, admin: true, muted: false, ...user },
                ...((selectedcomm || {}).users || []).map((usr) => {
                    if (usr.userId !== user._id) {
                        return {
                            user_id: usr.userId,
                            admin: false,
                            muted: false,
                            ...usr,
                        };
                    }
                }),
            ].filter(Boolean),
            title: data.topicName,
            invites: [],
            contentAge: data.contentAge,
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
            <form onSubmit={handleSubmit(createNewTopic)}>
                <input
                    {...register("topicName", { required: true })}
                    placeholder="Topic name"
                    type="text"
                />
                <ErrorMessage
                    errorMsg={
                        errors.topicName
                            ? "You must set a Topic name to begin."
                            : null
                    }
                />
                <p>Keep content posted to this topic for:</p>
                <label htmlFor="field-long">
                    <input
                        {...register("contentAge", { required: true })}
                        type="radio"
                        value="long"
                        id="field-long"
                    />
                    90 days
                </label>
                <label htmlFor="field-short">
                    <input
                        {...register("contentAge")}
                        type="radio"
                        value="short"
                        id="field-short"
                    />
                    24 hours
                </label>
                <ErrorMessage
                    errorMsg={
                        errors.contentAge ? "You must set contents age" : null
                    }
                />
                <Button
                    tier="secondary"
                    fullWidth
                    text="Create Topic"
                    type="submit"
                />
            </form>
        </Modal>
    );
}
