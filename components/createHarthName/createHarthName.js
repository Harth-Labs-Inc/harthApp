import { useForm } from "react-hook-form";
import React, { useEffect, useState } from "react";
import { uploadFile } from "../../services/helper";
import TalkingHead from "../TalkingHead/TalkingHead";
import ErrorMessage from "../Common/Input/ErrorMessage";
import { Button, Modal } from "../Common";
import IconUploader from "../IconUploader";
import { saveCommunity } from "../../requests/community";

import styles from "./CreateHarthName.module.scss";



export default function CreateHarthName({
    talkingHeadMsg,
    placeholder,
    submitText,
    submitHandler,
    closeHandler,
    footer,
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
            onToggleModal={closeHandler}
        >
            <div className={styles.mainContainer}>
                <div className={styles.title}>Create a härth</div>
                <TalkingHead text={talkingHeadMsg} />
                <div className={styles.imageHolder}>
                    <IconUploader
                        shape="square"
                        id={""}
                        icon={""}
                        name={""}
                        changeHandler={fileUploadHandler}
                    />
                    </div>
                <form onSubmit={handleSubmit(createNewHarth)} className={styles.form}>
                    <input
                        {...register("harthName", { required: true })}
                        placeholder={placeholder}
                        type="text"
                        className={styles.textEntry}

                    />
                    {errors.harthName
                    ?
                        <ErrorMessage errorMsg="You must set a Harth name to begin." />
                    :
                        <div className={styles.helpText}>{footer}</div>
                    }

                    <div className={styles.buttonBar}>
                        <Button
                            tier="secondary"
                            fullWidth
                            text="cancel"
                            onClick={closeHandler}
                            className={styles.cancelButton}
                        />
                        <Button
                            tier="primary"
                            fullWidth
                            text={submitText}
                            type="submit"
                            className={styles.submitButton}
                        />
                    </div>
                </form>
            </div>
        </Modal>
    );
}
