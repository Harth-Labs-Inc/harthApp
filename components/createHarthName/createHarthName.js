import { useForm } from "react-hook-form";

import TalkingHead from "../TalkingHead/TalkingHead";
import Modal from "../Modal";
import ErrorMessage from "../Common/Input/ErrorMessage";
import { Button } from "../Common";

import styles from "./CreateHarthName.module.scss";

export default function CreateHarthName({
    talkingHeadMsg,
    placeholder,
    submitText,
    submitHandler,
}) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const createNewHarth = (data) => {
        let newHarth = {
            name: data.harthName,
            iconKey: "",
            users: [],
            topics: [],
        };
        submitHandler(newHarth);
    };

    return (
        <Modal className={styles.CreateHarthNameModal}>
            <TalkingHead text={talkingHeadMsg} />
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
