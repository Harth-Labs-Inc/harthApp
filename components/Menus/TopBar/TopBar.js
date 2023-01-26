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
                    <div className={styles.TopBarName}>{selectedcomm?.name}<span className={styles.TopBarSection}>\ {currentPage}</span></div> 
                ) : null}
                {children}
                <div className={isMobile ? styles.avatarMobile : styles.avatarDesktop}>
                    <Avatar
                        isPressable={true}
                        picSize={isMobile ? 36 : 32}
                        pressHandler={editUserModalHandler}
                        imageSrc={iconKey}
                        darkBackground={true}
                        className={styles.avatarDesktop}
                    />
                </div> 

            </div>
        </>
    );
};

export default TopBar;
