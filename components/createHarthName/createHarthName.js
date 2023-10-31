import { useState } from "react";
import { useForm } from "react-hook-form";

import { compressImage } from "../../requests/s3";
import { uploadFile } from "../../services/helper";

import { Button, Modal } from "Common";

import TalkingHead from "../TalkingHead/TalkingHead";
import ErrorMessage from "../Common/Input/ErrorMessage";

import IconUploader from "../IconUploader";

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
            await compressImage(
                comms3Upload.name,
                comms3Upload.name,
                "community-profile-images",
                newFile.type,
                150,
                150
            );
            newHarth.iconKey = `https://community-profile-images.s3.us-east-2.amazonaws.com/${comms3Upload.name}`;
        } else {
            newHarth.iconKey = "/images/harth_default.png";
        }

        submitHandler(newHarth);
    };

    const fileUploadHandler = (file) => {
        setNewFile(file);
    };

    return (
        <Modal onToggleModal={closeHandler}>
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
                <form
                    onSubmit={handleSubmit(createNewHarth)}
                    className={styles.form}
                >
                    <input
                        {...register("harthName", {
                            required: true,
                            maxLength: 20,
                        })}
                        placeholder={placeholder}
                        type="text"
                        className={styles.textEntry}
                        autoComplete="off"
                        maxLength={20}
                    />
                    {errors.harthName ? (
                        <ErrorMessage errorMsg="You must set a Harth name to begin." />
                    ) : (
                        <div className={styles.helpText}>{footer}</div>
                    )}

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
