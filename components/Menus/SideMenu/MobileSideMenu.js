import { useState } from "react";
import { useComms } from "../../../contexts/comms";
import { useSocket } from "../../../contexts/socket";
import { SideModal } from "../../Common";
import SettingsMenu from "../AccountSettings";
import HarthList from "../HarthList/HarthList";

import { HarthLogoDark } from "../../../public/images/harth-logo-dark";
import styles from "./SideMenu.module.scss";

const MobileSideNav = (props) => {
    const { mobileMenuOpen, onToggleMenu, setShowCreateHarthNameModal } = props;
    const [ShowCommBuilder, setShowCommBuilder] = useState(false);

    const { comms, setComm, selectedcomm, setTopic } = useComms();
    const { unreadMsgs } = useSocket();

    const changeSelectedCom = (com) => {
        setComm(com);
        setTopic({});
        onToggleMenu();
    };

    const toggleCreateComm = () => {
        onToggleMenu();
        setShowCreateHarthNameModal(true);
    };

    if (!mobileMenuOpen) return;

    return (
        <SideModal
            id="left_nav"
            className={`${styles.SideNav} ${styles.Mobile} `}
            onToggleModal={onToggleMenu}
        >
            <div className={styles.headerImage}>
                <HarthLogoDark />
            </div>
            <HarthList
                comms={comms}
                selectedcomm={selectedcomm}
                unreadMsgs={unreadMsgs}
                toggleCreateComm={toggleCreateComm}
                changeSelectedCom={changeSelectedCom}
            />
            <SettingsMenu />
        </SideModal>
    );
};

export default MobileSideNav;
