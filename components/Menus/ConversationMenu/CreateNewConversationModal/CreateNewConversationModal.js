import { useForm } from "react-hook-form";
import { useEffect, useRef, useState } from "react";
import ErrorMessage from "../../../Common/Input/ErrorMessage";
import { Button, Modal } from "../../../Common";
import { useComms } from "../../../../contexts/comms";
import { useAuth } from "../../../../contexts/auth";
import { useSocket } from "../../../../contexts/socket";
import { getHarthByID } from "../../../../requests/community";
// import { addRoomToUsers } from "../../../../requests/rooms";
import { saveConversation } from "../../../../requests/conversations";
import styles from "./CreateNewConversationModal.module.scss";

export default function CreateNewConversationModal({ toggleModal }) {
  const [userList, setUserList] = useState([]);
  const blockedListRef = useRef();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const { user } = useAuth();
  const { selectedcomm, conversations, setSelectedConversation } = useComms();
  const { emitUpdate } = useSocket();

  const formRef = useRef();

  useEffect(() => {
    getCurrentUsers();
  }, []);

  useEffect(() => {
    blockedListRef.current = user?.BlockedList?.map(({ userId }) => userId);
  }, [user?.BlockedList]);

  const getCurrentUsers = async () => {
    const results = await getHarthByID(selectedcomm._id);
    const {
      data: { users },
    } = results;
    setUserList(users);
  };

  const arraysHaveSameUsers = (array1, array2) => {
    const sortedArray1 = array1.map((user) => user.userId).sort();
    const sortedArray2 = array2.map((user) => user.userId).sort();

    return JSON.stringify(sortedArray1) === JSON.stringify(sortedArray2);
  };

  const onSubmit = async (data) => {
    if (!Array.isArray(data.users) && !data.users) return;

    const userArray = (Array.isArray(data.users) ? data.users : [data.users])
      .map((usr) => {
        try {
          return JSON.parse(usr);
        } catch (error) {
          console.error("Failed to parse user:", error);
          return null;
        }
      })
      .filter(Boolean);

    const creator = selectedcomm.users?.find((usr) => usr.userId === user?._id);
    if (creator) userArray.push(creator);

    const existingConversation = conversations.find((conversation) =>
      arraysHaveSameUsers(userArray, conversation.OriginalUsers)
    );

    if (!existingConversation) {
      const conversation = {
        users: userArray,
        OriginalUsers: userArray,
        harthId: selectedcomm._id,
      };

      try {
        const { id } = await saveConversation(conversation);
        if (id) {
          conversation._id = id;
          toggleModal();
          conversation.updateType = "new conversation";
          emitUpdate(selectedcomm._id, conversation, (err) => {
            if (err) console.error(err);
          });
        }
      } catch (error) {
        console.error("Failed to save conversation:", error);
      }
    } else {
      toggleModal();
      setSelectedConversation(existingConversation);
    }
  };

  return (
    <Modal onToggleModal={toggleModal}>
      <div className={styles.mainContainer}>
        <div className={styles.title}>New Message</div>
        <form
          ref={formRef}
          onSubmit={handleSubmit(onSubmit)}
          className={styles.Content}
        >
          <div className={styles.helpText}>Select Recipients</div>
          <div className={styles.PeopleList}>
            {userList &&
              userList
                ?.filter((usr) => {
                  return (
                    usr.userId !== user._id &&
                    !blockedListRef.current?.includes(usr.userId)
                  );
                })
                .map((usr) => {
                  return (
                    <div key={usr.name} className={styles.Person}>
                      <input
                        ref={register}
                        type="checkbox"
                        value={JSON.stringify(usr)}
                        {...register("users", {
                          required: true,
                        })}
                      />
                      <div className={styles.imageHolder}>
                        <img src={usr?.iconKey} loading="lazy" />
                      </div>

                      <label htmlFor="">
                        <p>{usr.name}</p>
                      </label>
                    </div>
                  );
                })}
          </div>

          <ErrorMessage
            errorMsg={
              errors.users ? "You must select at least one person" : null
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
