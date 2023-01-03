import { useState } from "react";
import { useAuth } from "../../../contexts/auth";
import { BackButton } from "../../Common/Buttons/BackButton";
import { EditButton } from "../../Common/Buttons/EditButton";
import { Button } from "../../Common/Buttons/Button";
import styles from "./SettingsMenu.module.scss";

const AccountProfile = (props) => {
    const { toggleCurrentPage } = props;
    const { user } = useAuth();
    const [currentTab, setCurrentTab] = useState("");

    const toggleCurrentSetting = (name) => {
        setCurrentTab(name);
    };

    const submitHandler = () => {
        console.log("change email");
    };

    const handleBack = () => {
        toggleCurrentPage("");
    };

    const SettingsMenu = () => {
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
                        <EditButton clickHandler={() => toggleCurrentSetting("email")} />
                    </div>


                    <div className={styles.SettingsContainerTitle}>Full Name</div>
                    <div className={styles.optionHolder}>
                        {user.fullName}
                        <EditButton clickHandler={() => toggleCurrentSetting("fullName")} />
                    </div>

                    <div className={styles.SettingsContainerTitle}>Birthday</div>
                    <div className={styles.optionHolder}>
                        {user.dob}
                        <EditButton clickHandler={() => toggleCurrentSetting("dob")} />
                    </div>
                </div>
            </div>
        );
    };

    const ActiveSetting = () => {

        return (
            <>
            <div className={styles.SettingsContainer}>

            <div className={styles.SettingsContainerHeader}>
                <BackButton clickHandler={() => toggleCurrentSetting("")} />
                <p>
                {currentTab == "dob" && "Edit Birthday"}
                {currentTab == "fullName" && "Edit Name"}
                {currentTab == "email" && "Edit Email"}
                </p>
            </div>

                <form className={styles.EditContainer} onSubmit={submitHandler}>

                    {currentTab == "dob" 
                    ? (
                        <input
                        value={user[currentTab]}
                        // setting value here means the user can't edit.
                        // using placeholder instead of value doesn't
                        // show the user birthday 
                        type="date"
                        className={styles.inputEdit}

                        />
                    ):(
                        <input
                        placeholder={user[currentTab]}
                        
                        type="text"
                        className={styles.inputEdit}

                        />
                    )}
                   
                    <div className={styles.buttonBar}>
                        <Button size="small" text="Cancel" tier="secondary" onClick={() => toggleCurrentSetting("")} className={styles.cancelButton}></Button>
                        <Button size="small" text="Confirm" onClick={() => toggleCurrentSetting("")}></Button> 
                        {/* The logic on the confirm button needs to be updated.  */}

                    </div>

                </form>
            </div>
            </>
        );

    };

    if (!currentTab) {
        return <SettingsMenu />;
    }
    return <ActiveSetting />;
};

export default AccountProfile;
