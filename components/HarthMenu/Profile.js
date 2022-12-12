import { useEffect, useState, useRef } from "react";
import { updateUserInfo } from "../../requests/community";

import { useComms } from "../../contexts/comms";
import { useAuth } from "../../contexts/auth";

import Form from "../Form-comp";
import { Input, ToggleSwitch } from "../Common";

const Profile = () => {
    const [bday, setBday] = useState();
    const [profile, setProfile] = useState({});
    const { user } = useAuth();
    const { selectedcomm } = useComms();

    const [toggleData, setToggleData] = useState({});
    const [editName, setEditName] = useState(false);

    const [formData, setFormData] = useState({
        image: {},
        profName: "",
    });

    const imagePreview = useRef();

    useEffect(() => {
        let creator = selectedcomm.users.find((usr) => usr.userId === user._id);
        setProfile(creator);
        setToggleData({
            ...(creator.personalInfo || {}),
        });
    }, [selectedcomm]);

    const ProfileImage = () => {
        if (profile.iconKey) {
            return <img src={profile.iconKey} />;
        }
        return null;
    };

    const saveFile = (file) => {
        let isBadFile = checkForBadFile(file);
        if (isBadFile) {
        } else {
            setFormData({ ...formData, image: file });
            imagePreview.current.src = URL.createObjectURL(file);
        }
    };
    const dropHandler = (e) => {
        let isFolder = checkForFolder(e);
        let { file, folder } = isFolder;
        if (!folder && file) {
            saveFile(file);
        }
    };

    const toggleHandler = (toggle, status) => {
        setToggleData({ ...toggleData, [toggle]: status });
    };
    const toggleEditName = () => {
        setEditName(!editName);
    };
    const inputChangeHandler = (eData, data) => {
        setFormData(data);
    };

    return (
        <>
            <Form id="edit-profile" data={formData}>
                <span className="profile-image">
                    <div id="profile_image">
                        <div id="profile_image_select">
                            <div
                                id="drop-zone"
                                onDragEnter={(e) => {
                                    e.preventDefault();
                                    return false;
                                }}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                }}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    dropHandler(e);
                                }}
                                onDragLeave={(e) => {
                                    e.preventDefault();
                                }}
                            >
                                <ProfileImage>
                                    <input
                                        type="file"
                                        name="image-uploader"
                                        id="image-uploader"
                                        onChange={(e) => {
                                            let file = e.target.files[0];
                                            saveFile(file);
                                        }}
                                    ></input>
                                </ProfileImage>
                                <img ref={imagePreview} />
                            </div>
                        </div>
                    </div>
                </span>
                <span>
                    <h2>
                        {editName ? (
                            <Input
                                name="profName"
                                title={profile.name}
                                changeHandler={inputChangeHandler}
                            ></Input>
                        ) : (
                            profile.name
                        )}
                        <button onClick={toggleEditName}></button>
                    </h2>
                </span>
                <hr></hr>
                <h3>Privacy</h3>
                <p>Select what you want to share with {selectedcomm.name}</p>
                <fieldset id="toggle-field">
                    <div>
                        <ToggleSwitch
                            onToggleChange={toggleHandler}
                            toggleName="name"
                            isChecked={toggleData["name"]}
                        ></ToggleSwitch>
                        <p>
                            {user.fullName} <span>Real Name</span>
                        </p>
                    </div>
                    <div>
                        <ToggleSwitch
                            onToggleChange={toggleHandler}
                            toggleName="email"
                            isChecked={toggleData["email"]}
                        ></ToggleSwitch>
                        <p>
                            {user.email} <span>Email</span>
                        </p>
                    </div>
                    <div>
                        <ToggleSwitch
                            onToggleChange={toggleHandler}
                            toggleName="bday"
                            isChecked={toggleData["bday"]}
                        ></ToggleSwitch>
                        <p>
                            {user.bday}
                            <span>Birthday (only month and day)</span>
                        </p>
                    </div>
                </fieldset>
            </Form>
        </>
    );
};

// export default Profile
