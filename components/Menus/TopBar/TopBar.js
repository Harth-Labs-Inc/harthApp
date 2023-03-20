import { useContext, useState } from "react";
import { useComms } from "../../../contexts/comms";
import { MobileContext } from "../../../contexts/mobile";

import styles from "./TopBar.module.scss";
import HarthProfileEditModal from "../../HarthProfileEditModal";
import UserIcon from "../../UserIcon/userIcon";

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

    let { iconKey } = profile;

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
            <div
                className={`
                    ${styles.TopBar}
                    ${isMobile && styles.TopBarMobile}
                    `}
            >
                {isMobile ? (
                    <div className={styles.TopBarName}>
                        {selectedcomm?.name}
                        <span className={styles.TopBarSection}>
                            \ {currentPage}
                        </span>
                    </div>
                ) : null}
                {children}
                <div
                    className={
                        isMobile ? styles.avatarMobile : styles.avatarDesktop
                    }
                >
                    <UserIcon
                        img={iconKey}
                        showName={false}
                        size="small"
                        isPressable
                        pressHandler={editUserModalHandler}
                    />
                </div>
            </div>
        </>
    );
};

export default TopBar;
