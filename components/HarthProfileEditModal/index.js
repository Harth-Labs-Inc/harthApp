import React, { useEffect, useState } from "react";

import { uploadFile } from "../../services/helper";
import { updateHarthData } from "../../requests/community";
import { useComms } from "../../contexts/comms";

import Modal from "../Modal";
import IconUploader from "../IconUploader";
import { Button } from "../Common";

const HarthProfileEditModal = ({ hidden, setHidden, harth, profile }) => {
    const [updatedProfile, setUpdatedProfile] = useState({});
    const [newFile, setNewFile] = useState(null);

    const { setComm, setCommsFromChild, comms } = useComms();

    useEffect(() => {
        if (profile) {
            setUpdatedProfile(profile);
        }
    }, [profile]);

    if (hidden) {
        return null;
    }

    const fileUploadHandler = (file) => {
        setNewFile(file);
    };
    const nameChangeHandler = (e) => {
        const { value } = e.target;
        setUpdatedProfile({ ...updatedProfile, ["name"]: value });
    };
    const submitHandler = async (e) => {
        e.preventDefault();
        let newIconKey = "";
        if (newFile) {
            let { ok, name } = await uploadFile({
                file: newFile,
                bucket: "community-profile-images",
            });
            if (ok) {
                newIconKey = `https://community-profile-images.s3.us-east-2.amazonaws.com/${name}`;
            }
        }
        let usersArr = [...harth.users];

        Object.assign(
            usersArr.find(
                ({ userId }) => userId.toString() == updatedProfile.userId
            ),
            {
                ...updatedProfile,
                ["iconKey"]: newIconKey ? newIconKey : updatedProfile.iconKey,
            }
        );
        harth.users = usersArr;
        let newharth = { ...harth };
        let { ok } = await updateHarthData(newharth);
        if (ok) {
            let commsArr = [...comms];
            Object.assign(
                commsArr.find(({ _id }) => _id.toString() == newharth._id),
                newharth
            );
            setCommsFromChild(commsArr);
            setComm(newharth);
            setHidden();
        }
    };

    const handleCancel = () => {
        setHidden();
    };

    let { iconKey, name } = updatedProfile;
    return (
        <Modal onToggleModal={setHidden}>
            <IconUploader
                shape="circle"
                id={harth?._id || ""}
                icon={iconKey}
                name={name}
                changeHandler={fileUploadHandler}
            />
            <form onSubmit={submitHandler}>
                <input
                    placeholder={name || "User Name"}
                    value={name}
                    onChange={nameChangeHandler}
                    required
                />
                <div>
                    <Button
                        text="Cancel"
                        tier="secondary"
                        onClick={handleCancel}
                    />
                    <Button type="submit" text="Update" />
                </div>
            </form>
        </Modal>
    );
};

export default HarthProfileEditModal;
