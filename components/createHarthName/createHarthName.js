import { useForm } from "react-hook-form";
import React, { useEffect, useState } from "react";
import { uploadFile } from "../../services/helper";
import TalkingHead from "../TalkingHead/TalkingHead";
import Modal from "../Modal";
import ErrorMessage from "../Common/Input/ErrorMessage";
import { Button } from "../Common";
import IconUploader from "../IconUploader";
import styles from "./CreateHarthName.module.scss";
import { saveCommunity } from "../../requests/community";
export default function CreateHarthName({
    talkingHeadMsg,
    placeholder,
    submitText,
    submitHandler,
    closeHandler,
}) {
    const [newFile, setNewFile] = useState(null);
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const createNewHarth = async (data) => {
        let newHarth = {
            name: data.harthName,
            iconKey: "",
            users: [],
            topics: [],
        };
        let comms3Upload;

        if (newFile) {
            comms3Upload = await uploadFile({
                file: newFile,
                bucket: "community-profile-images",
            });
            newHarth.iconKey = `https://community-profile-images.s3.us-east-2.amazonaws.com/${comms3Upload.name}`;
        }

        submitHandler(newHarth);
    };

    const fileUploadHandler = (file) => {
        setNewFile(file);
    };

    console.log(newFile, "newFile");

    return (
        <Modal
            className={styles.CreateHarthNameModal}
            onToggleModal={closeHandler}
        >
            <TalkingHead text={talkingHeadMsg} />
            <IconUploader
                shape="circle"
                id={""}
                icon={""}
                name={""}
                changeHandler={fileUploadHandler}
            />
            <form onSubmit={handleSubmit(createNewHarth)}>
                <input
                    {...register("harthName", { required: true })}
                    placeholder={placeholder}
                    type="text"
                />
                <ErrorMessage
                    errorMsg={
                        errors.harthName
                            ? "You must set a Harth name to begin."
                            : null
                    }
                />
                <p>
                    Give your harth a name and a cool sigil. No need to think
                    too hard, you can change them at any time.
                </p>
                <Button
                    tier="secondary"
                    fullWidth
                    text={submitText}
                    type="submit"
                />
            </form>
        </Modal>
    );
}
