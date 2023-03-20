import { useComms } from "../../../contexts/comms";
import { useSocket } from "../../../contexts/socket";
import { SideModal } from "../../Common";

import HarthList from "../HarthList/HarthList";

import { HarthLogoLight } from "../../../public/images/harth-logo-light";
import styles from "./SideMenu.module.scss";

import SettingsList from "../AccountSettings/AccountSettings";

const MobileSideNav = (props) => {
    const { mobileMenuOpen, onToggleMenu, setShowCreateHarthNameModal } = props;
    // const [ShowCommBuilder, setShowCommBuilder] = useState(false);

    const { comms, setComm, selectedcomm, setTopic } = useComms();
    const { unreadMessagesRef } = useSocket();

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
        <SideModal onToggleModal={onToggleMenu}>
            <div className={styles.sideNavMobile}>
                <div className={styles.headerImage}>
                    <HarthLogoLight />
                </div>
                <div className={styles.text}>Your härths</div>
                <div className={styles.harthList}>
                    <HarthList
                        comms={comms}
                        selectedcomm={selectedcomm}
                        unreadMsgs={unreadMessagesRef}
                        toggleCreateComm={toggleCreateComm}
                        changeSelectedCom={changeSelectedCom}
                    />
                </div>
                <div className={styles.settings}>
                    <SettingsList />
                </div>
            </div>
        </SideModal>
    );
};

export default MobileSideNav;
