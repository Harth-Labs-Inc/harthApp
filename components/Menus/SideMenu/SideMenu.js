import { useContext, useState, useRef } from "react";

import { useAuth } from "../../../contexts/auth";
import { useComms } from "../../../contexts/comms";
import { useSocket } from "../../../contexts/socket";
import { user } from "../../../contexts/auth";
import { deleteHarthByID, leaveHarthByID } from "../../../requests/community";
import { MobileContext } from "../../../contexts/mobile";
import { IconAdd } from "../../../resources/icons/IconAdd";
import { IconMenu } from "../../../resources/icons/IconMenu";
import { updateHarthData } from "../../../requests/community";

import { Modal, SideModal } from "../../Common";
import HarthEditModal from "../../HarthEditModal";
import { CustomHarthContextMenu } from "../../CustomHarthContextMenu/CustomHarthContextMenu";

import HarthDeleteModal from "../HarthSettings/HarthDeleteModal";
import HarthLeaveModal from "../HarthSettings/HarthLeaveModal";
import SettingsMenu from "../AccountSettings";
import HarthList from "../HarthList/HarthList";

import styles from "./SideMenu.module.scss";

import CreateHarthName from "../../createHarthName/createHarthName";
import CreateHarthProfile from "../../createHarthProfile/createHarthProfile";

const SideNav = (props) => {
    const { menuOpen, onToggleMenu } = props;
    const [ShowSettingsNav, setShowSettingsNav] = useState(false);
    const [openEditHarthMenu, setOpenEditHarthMenu] = useState(null);
    const [showRenameHarthModal, setShowRenameHarthModal] = useState(false);
    const [showDeleteHarthModal, setShowDeleteHarthModal] = useState(false);
    const [showLeaveHarthModal, setShowLeaveHarthModal] = useState(false);

    const [newHarth, setNewHarth] = useState(null);
    const [showCreateHarthNameModal, setShowCreateHarthNameModal] =
        useState(false);
    const [showCreateHarthProfileModal, setShowCreateHarthProfileModal] =
        useState(false);

    const { isMobile } = useContext(MobileContext);
    const { user } = useAuth();
    const { comms, setComm, selectedcomm, setTopic, updateSelectedHarth } =
        useComms();
    const { emitUpdate, unreadMessagesRef } = useSocket();

    let leftNav = useRef();

    const changeSelectedCom = (com) => {
        setComm(com);
        setTopic({});
        onToggleMenu();
    };
    const toggleSettingsNav = () => {
        setShowSettingsNav(!ShowSettingsNav);
    };
    const DisplaySettingsNav = () => {
        if (ShowSettingsNav) {
            return (
                <SideModal onToggleModal={toggleSettingsNav}>
                    <SettingsMenu />
                </SideModal>
            );
        }
        return null;
    };
    const toggleHarthEditModal = ({ harth, pos }) => {
        setOpenEditHarthMenu({ harth, pos });
    };
    const closeHarthEditModal = () => {
        if (
            !showRenameHarthModal &&
            !showDeleteHarthModal &&
            !showLeaveHarthModal
        ) {
            setOpenEditHarthMenu(null);
        }
    };
    const onMuteHandler = async () => {
        await updateSelectedHarth({
            newHarth: {
                ...openEditHarthMenu.harth,
                users: [
                    ...(openEditHarthMenu.harth.users || []).map((usr) => {
                        if (usr.userId == user._id) {
                            return {
                                ...usr,
                                muted: !usr.muted,
                            };
                        } else {
                            return usr;
                        }
                    }),
                ],
            },
        });
        closeHarthEditModal();
    };
    const onRenameHandler = () => {
        setShowRenameHarthModal(true);
    };
    const onCloseRenameModal = () => {
        setShowRenameHarthModal(false);
    };
    const submitHarthChangeHandler = async (newHarth) => {
        await updateHarthData(newHarth);
        let msg = {};
        msg.updateType = "harth edited";
        msg.comm = newHarth;
        emitUpdate(selectedcomm._id, msg, async (err, status) => {
            if (err) {
            }
            setShowRenameHarthModal(false);
            setOpenEditHarthMenu(null);
        });
    };
    const onDeleteHandler = () => {
        setShowDeleteHarthModal(true);
    };
    const onCloseDeleteModal = () => {
        setShowDeleteHarthModal(false);
    };
    const submitHarthDeleteHandler = async (newHarth) => {
        await deleteHarthByID(newHarth._id);
        let msg = {};
        msg.updateType = "harth deleted";
        msg.comm = newHarth;
        emitUpdate(selectedcomm._id, msg, async (err, status) => {
            if (err) {
                console.error(err);
            }
            setShowDeleteHarthModal(false);
            setOpenEditHarthMenu(null);
        });
    };
    const onLeaveHandler = () => {
        setShowLeaveHarthModal(true);
    };
    const onCloseLeaveModal = () => {
        setShowLeaveHarthModal(false);
    };

    const submitHarthLeaveHandler = async (newHarth) => {
        await leaveHarthByID({ harth: newHarth, user });
        let msg = {};
        msg.updateType = "harth deleted";
        msg.comm = newHarth;
        emitUpdate(selectedcomm._id, msg, async (err, status) => {
            if (err) {
                console.error(err);
            }
            setShowLeaveHarthModal(false);
            setOpenEditHarthMenu(null);
        });
    };

    const harthNameCreationHandler = async (harth) => {
        setNewHarth(harth);
        setShowCreateHarthNameModal(false);
        setShowCreateHarthProfileModal(true);
    };
    const resetNewHarth = () => {
        const showFirstTimeUser = localStorage.getItem("showFirstTimeUser");
        if (showFirstTimeUser) {
            localStorage.removeItem("showFirstTimeUser");
        }
        setNewHarth(null);
        setShowCreateHarthProfileModal(false);
    };

    if (isMobile) {
        return;
    }

    return (
        <>
            {showCreateHarthNameModal ? (
                <CreateHarthName
                    talkingHeadMsg="Give your härth a name and and image"
                    footer="Tip: You can change your härth name and image at any time"
                    placeholder="härth name"
                    submitText="Create"
                    closeHandler={() => setShowCreateHarthNameModal(false)}
                    submitHandler={harthNameCreationHandler}
                />
            ) : null}
            {showCreateHarthProfileModal ? (
                <CreateHarthProfile
                    talkingHeadMsg="Enter the name you would like to be called in your new härth and add a profile picture"
                    footer="Familiar Tip: You can change your profile name nad picture at any time"
                    placeholder="your profile name"
                    submitText="Join"
                    submitHandler={resetNewHarth}
                    harth={newHarth}
                />
            ) : null}
            {showDeleteHarthModal ? (
                <Modal onToggleModal={() => {}}>
                    <HarthDeleteModal
                        submitHarthChange={submitHarthDeleteHandler}
                        hidden={!showDeleteHarthModal}
                        setHidden={onCloseDeleteModal}
                        harth={{
                            ...(openEditHarthMenu?.harth || {}),
                        }}
                    />
                </Modal>
            ) : null}
            {showLeaveHarthModal ? (
                <Modal onToggleModal={() => {}}>
                    <HarthLeaveModal
                        submitHarthChange={submitHarthLeaveHandler}
                        hidden={!showLeaveHarthModal}
                        setHidden={onCloseLeaveModal}
                        harth={{
                            ...(openEditHarthMenu?.harth || {}),
                        }}
                    />
                </Modal>
            ) : null}
            {showRenameHarthModal ? (
                <Modal onToggleModal={() => {}}>
                    <HarthEditModal
                        submitHarthChangeHandler={submitHarthChangeHandler}
                        hidden={!showRenameHarthModal}
                        setHidden={onCloseRenameModal}
                        harth={{
                            ...(openEditHarthMenu?.harth || {}),
                        }}
                    />
                </Modal>
            ) : null}

            {openEditHarthMenu ? (
                <CustomHarthContextMenu
                    user={user}
                    harth={openEditHarthMenu.harth}
                    pos={openEditHarthMenu.pos}
                    closeModal={closeHarthEditModal}
                    onMuteHandler={onMuteHandler}
                    onRenameHandler={onRenameHandler}
                    onDeleteHandler={onDeleteHandler}
                    onLeaveHandler={onLeaveHandler}
                />
            ) : null}
            <DisplaySettingsNav />
            <aside className={styles.SideNav} ref={leftNav}>
                <HarthList
                    comms={comms}
                    selectedcomm={selectedcomm}
                    unreadMsgs={unreadMessagesRef}
                    toggleCreateComm={setShowCreateHarthNameModal}
                    changeSelectedCom={changeSelectedCom}
                    toggleHarthEditModal={toggleHarthEditModal}
                />
                <button
                    className={styles.CreateHarthButton}
                    onClick={setShowCreateHarthNameModal}
                >
                    <IconAdd />
                </button>

                <div className={styles.bottomHolder}>
                    <button
                        className={styles.SettingsButton}
                        onClick={toggleSettingsNav}
                        aria-label="Toggle Settings menu"
                    >
                        <IconMenu fill="#fff" />
                    </button>
                </div>
            </aside>
        </>
    );
};

export default SideNav;
