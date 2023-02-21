import { useForm } from "react-hook-form";
import React, { useEffect, useRef, useState } from "react";
import ErrorMessage from "../../../Common/Input/ErrorMessage";
import { Button, Modal } from "../../../Common";
import { useComms } from "../../../../contexts/comms";
import { useAuth } from "../../../../contexts/auth";
import { useSocket } from "../../../../contexts/socket";
import { saveTopics, getHarthByID } from "../../../../requests/community";
import { addRoomToUsers } from "../../../../requests/rooms";
import { saveConversation } from "../../../../requests/conversations";
import styles from "./CreateNewConversationModal.module.scss";

export default function CreateNewConversationModal({ toggleModal }) {
    const [userList, setUserList] = useState([]);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const { user } = useAuth();
    const { selectedcomm } = useComms();
    const { emitUpdate } = useSocket();

    const formRef = useRef();

    useEffect(() => {
        getCurrentUsers();
    }, []);

    const getCurrentUsers = async () => {
        const results = await getHarthByID(selectedcomm._id);
        const {
            data: { users },
        } = results;
        setUserList(users);
    };

    const onSubmit = async (data) => {
        let userArray = [];
        let isArrray = Array.isArray(data.users);
        if (isArrray) {
            userArray = data.users.map((usr) => {
                let userObj = {};

                try {
                    userObj = JSON.parse(usr);
                } catch (error) {
                    userObj = {};
                }

                return userObj;
            });
        } else if (data.users) {
            try {
                let parsedUser = JSON.parse(data.users);
                if (parsedUser) {
                    userArray = [parsedUser];
                }
            } catch (error) {
                userArray = [];
            }
        }

        let creator = selectedcomm.users?.find(
            (usr) => usr.userId === user?._id
        );

        if (creator) {
            userArray.push(creator);
        }

        let conversation = {
            users: userArray,
            harthId: selectedcomm._id,
        };
        let { id } = await saveConversation(conversation);
        if (id) {
            conversation._id = id;
            toggleModal();
            conversation.updateType = "new conversation";
            emitUpdate(selectedcomm._id, conversation, async (err, status) => {
                if (err) {
                    console.log(err);
                }
                let { ok } = status;
            });
        }
    };

    return (
        <Modal onToggleModal={toggleModal}>
            <div className={styles.mainContainer}>
                <div className={styles.title}>New conversation</div>
                <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className={styles.Content}>
                    <div className={styles.helpText}>Select Recipients</div>
                    <div className={styles.PeopleList}>
                    {userList &&
                        userList
                            ?.filter((usr) => {
                                console.log(usr);
                                return usr.userId !== user._id;
                            })
                            .map((usr) => {
                                return (
                                    <div className={styles.Person}>
                                        <input
                                            ref={register}
                                            type="checkbox"
                                            value={JSON.stringify(usr)}
                                            {...register("users", {
                                                required: true,
                                            })}
                                        />
                                        <div className={styles.imageHolder}>
                                        <img src={usr?.iconKey} />
                                        </div>

                                        <label
                                            htmlFor=""
                                        >
                                           <p>{usr.name}</p>
                                        </label>
                                    </div>
                                );
                    })}
                    </div>

                    <ErrorMessage
                        errorMsg={
                            errors.users
                                ? "You must select at least one person"
                                : null
                        }

                    />
                    <div className={styles.ButtonBar}>
                        <Button
                            type="button"
                            size="large"
                            tier="secondary"
                            text="Cancel"
                            onClick={toggleModal}
                        />
                        <Button
                            size="large"
                            tier="primary"
                            type="submit"
                            text="Create"
                            fullWidth={true}
                            onClick={() => {}}
                        />
                    </div>
                </form>
            </div>
        </Modal>
    );
}
