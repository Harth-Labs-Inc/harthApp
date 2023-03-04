import { useState } from "react";
import { useAuth } from "../../../contexts/auth";
import { BackButton } from "../../Common/Buttons/BackButton";
import { EditButton } from "../../Common/Buttons/EditButton";
import { Button } from "../../Common/Buttons/Button";
import styles from "./SettingsMenu.module.scss";
import { saveAcountSettingsUpdates } from "../../../requests/userApi";

const AccountProfile = (props) => {
    const { toggleCurrentPage } = props;
    const { user, setContextUser } = useAuth();
    const [currentTab, setCurrentTab] = useState("");
    const [formData, setFormData] = useState({ ...user });
    const [error, setError] = useState("");

    const toggleCurrentSetting = (name) => {
        setCurrentTab(name);
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        let results = await saveAcountSettingsUpdates(
            user._id,
            currentTab,
            formData[currentTab]
        );
        if (results.ok) {
            setContextUser({ ...user, [currentTab]: formData[currentTab] });
        } else {
            setError(results.msg);
        }
    };

    const handleBack = () => {
        toggleCurrentPage("");
    };
    const inputChangeHandler = (e) => {
        const { value } = e.target;

        setFormData({
            ...formData,
            [currentTab]: value,
        });
    };

    if (!currentTab) {
        return (
            <div className={styles.SettingsContainer}>
                <div className={styles.SettingsContainerHeader}>
                    <BackButton clickHandler={handleBack} />
                    <p>Your Account</p>
                </div>

                <div className={styles.sectionContainer}>
                    <div className={styles.SettingsContainerTitle}>Email</div>
                    <div className={styles.optionHolder}>
                        {user.email}
                        <EditButton
                            clickHandler={() => toggleCurrentSetting("email")}
                        />
                    </div>

                    <div className={styles.SettingsContainerTitle}>
                        Full Name
                    </div>
                    <div className={styles.optionHolder}>
                        {user.fullName}
                        <EditButton
                            clickHandler={() =>
                                toggleCurrentSetting("fullName")
                            }
                        />
                    </div>

                    <div className={styles.SettingsContainerTitle}>
                        Birthday
                    </div>
                    <div className={styles.optionHolder}>
                        {user.dob}
                        <EditButton
                            clickHandler={() => toggleCurrentSetting("dob")}
                        />
                    </div>
                </div>
            </div>
        );
    }
    return (
        <>
            <div className={styles.SettingsContainer}>
                <div className={styles.SettingsContainerHeader}>
                    <BackButton
                        clickHandler={() => {
                            setError("");
                            setFormData({ ...user });
                            toggleCurrentSetting("");
                        }}
                    />
                    <p>
                        {currentTab == "dob" && "Edit Birthday"}
                        {currentTab == "fullName" && "Edit Name"}
                        {currentTab == "email" && "Edit Email"}
                    </p>
                </div>

                <form className={styles.EditContainer} onSubmit={submitHandler}>
                    {currentTab == "dob" ? (
                        <input
                            value={formData[currentTab] || ""}
                            type="date"
                            className={styles.inputEdit}
                            onInput={inputChangeHandler}
                            required
                        />
                    ) : (
                        <input
                            value={formData[currentTab] || ""}
                            placeholder={formData[currentTab]}
                            onInput={inputChangeHandler}
                            type="text"
                            className={styles.inputEdit}
                            required
                        />
                    )}
                    <p>{error}</p>
                    <div className={styles.buttonBar}>
                        <Button
                            size="small"
                            text="Cancel"
                            tier="secondary"
                            type="button"
                            onClick={() => {
                                setError("");
                                setFormData({ ...user });
                                toggleCurrentSetting("");
                            }}
                            className={styles.cancelButton}
                        ></Button>
                        <Button
                            size="small"
                            text="Confirm"
                            type="submit"
                        ></Button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default AccountProfile;
