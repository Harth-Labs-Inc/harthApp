import { useContext, useState } from "react";
import { Avatar } from "../../Common/Avatar/Avatar";
import { useComms } from "../../../contexts/comms";
import { MobileContext } from "../../../contexts/mobile";

import styles from "./TopBar.module.scss";
import HarthProfileEditModal from "../../HarthProfileEditModal";

const TopBar = ({ children, currentPage }) => {
    const [showEditUserModal, setShowEditUserModal] = useState(false);

    const { selectedcomm, profile } = useComms();
    const { isMobile } = useContext(MobileContext);

    const editUserModalHandler = () => {
        setShowEditUserModal((prevState) => !prevState);
    };

    if (!profile) {
        return null;
    }

    let { name, iconKey } = profile;

    return (
        <>
            <HarthProfileEditModal
                hidden={!showEditUserModal}
                setHidden={editUserModalHandler}
                harth={{
                    ...(selectedcomm || {}),
                }}
                profile={profile}
            />
            <div className={styles.TopBar}>
                {isMobile ? (
                    <div className={styles.TopBarName}>{currentPage}</div> // {name}
                ) : null}
                {children}
                <Avatar
                    isPressable={true}
                    picSize={36}
                    pressHandler={editUserModalHandler}
                    imageSrc={iconKey}
                />
            </div>
        </>
    );
};

export default TopBar;
