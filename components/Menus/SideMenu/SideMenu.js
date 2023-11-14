import { useContext, useState, useRef } from "react";
import { useAuth } from "../../../contexts/auth";
import { useComms } from "../../../contexts/comms";
import { useSocket } from "../../../contexts/socket";
import {
  deleteHarthByID,
  getComms,
  leaveHarthByID,
} from "../../../requests/community";
import { MobileContext } from "../../../contexts/mobile";
import { IconMenu } from "../../../resources/icons/IconMenu";
import { IconInvite } from "resources/icons/IconInvite";
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
import { IconFeedback } from "resources/icons/IconFeedback";
import { FeedbackModal } from "components/FeedbackModal/FeedbackModal";
import InviteComp from "../AccountSettings/Invite";
import { IconInviteEmail } from "resources/icons/IconInviteEmail";

const SideNav = (props) => {
  const { onToggleMenu, toggleNoHarthDetected } = props;
  const [ShowSettingsNav, setShowSettingsNav] = useState(false);
  const [openEditHarthMenu, setOpenEditHarthMenu] = useState(null);
  const [showRenameHarthModal, setShowRenameHarthModal] = useState(false);
  const [showDeleteHarthModal, setShowDeleteHarthModal] = useState(false);
  const [showLeaveHarthModal, setShowLeaveHarthModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [currentTab, setCurrentTab] = useState("");
  const [showInviteModal, setShowInviteModal] = useState(false);

  const [newHarth, setNewHarth] = useState(null);
  const [showCreateHarthNameModal, setShowCreateHarthNameModal] =
    useState(false);
  const [showCreateHarthProfileModal, setShowCreateHarthProfileModal] =
    useState(false);

  const { isMobile } = useContext(MobileContext);
  const { user } = useAuth();
  const {
    comms,
    selectedcomm,
    updateSelectedHarth,
    changeSelectedCommFromChild,
  } = useComms();
  const { emitUpdate, unreadMessagesRef, unreadConvMessagesRef } = useSocket();

  let leftNav = useRef();

  const toggleCurrentTab = (name) => {
    setCurrentTab(name);
  };
  const changeSelectedCom = (com) => {
    localStorage.setItem("selectedHarthID", com._id);
    changeSelectedCommFromChild(com);
    onToggleMenu();
  };
  const toggleSettingsNav = (e, setOpenInvites) => {
    if (setOpenInvites) {
      setCurrentTab("invites");
    } else {
      setCurrentTab("");
    }
    setShowSettingsNav(!ShowSettingsNav);
  };
  const DisplaySettingsNav = () => {
    if (ShowSettingsNav) {
      return (
        <SideModal id="SettingsMenu" onToggleModal={toggleSettingsNav}>
          <SettingsMenu
            toggleCurrentTab={toggleCurrentTab}
            currentTab={currentTab}
          />
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
    emitUpdate(selectedcomm._id, msg, async (err) => {
      if (err) {
        console.error(err);
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
    emitUpdate(selectedcomm._id, msg, async (err) => {
      if (err) {
        console.error(err);
      }
      setShowDeleteHarthModal(false);
      setOpenEditHarthMenu(null);
      let result = await getComms(user);
      const { ok, comms } = result;
      if (!ok || !comms || !comms.length) {
        toggleNoHarthDetected(true);
      } else {
        toggleNoHarthDetected(false);
      }
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
    emitUpdate(selectedcomm._id, msg, async (err) => {
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
  const toggleFeedbackModal = () => {
    setShowFeedbackModal(!showFeedbackModal);
  };
  const toggleInviteModal = () => {
    setShowInviteModal(!showInviteModal);
  };

  if (isMobile) {
    return;
  }

  return (
    <>
      {showInviteModal ? (
        <InviteComp toggleCurrentPage={toggleInviteModal} />
      ) : null}
      {showFeedbackModal ? (
        <FeedbackModal
          onToggleModal={toggleFeedbackModal}
          disableOutsideClose={true}
        />
      ) : null}
      {showCreateHarthNameModal ? (
        <CreateHarthName
          talkingHeadMsg="Select an icon and give your härth a name"
          footer="Tip: You can change your härth name and image at any time"
          placeholder="härth name"
          submitText="Create"
          closeHandler={() => setShowCreateHarthNameModal(false)}
          submitHandler={harthNameCreationHandler}
        />
      ) : null}
      {showCreateHarthProfileModal ? (
        <CreateHarthProfile
          talkingHeadMsg={`Enter a name and select an image for your profile for this härth`}
          footer="Each härth has a unique profile. Customize each profile to match your härth."
          placeholder="profile name"
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
          unreadConvMsgs={unreadConvMessagesRef}
          toggleCreateComm={setShowCreateHarthNameModal}
          changeSelectedCom={changeSelectedCom}
          toggleHarthEditModal={toggleHarthEditModal}
        />

        <div className={styles.bottomHolder}>
          {/* <button
            className={` ${styles.SettingsButton} ${styles.SettingsButtonFeedback} `}
            onClick={toggleFeedbackModal}
            aria-label="Toggle User Feedback menu"
          >
            <IconFeedback />
          </button> */}
          <button
            //className={` ${styles.SettingsButton} ${styles.SettingsButtonInvites} `}
            className={styles.InviteButton}

            onClick={toggleInviteModal}
            aria-label="Toggle Invites menu"
          >
            
            <IconInviteEmail />
          </button>
          <button
            className={styles.SettingsButton}
            onClick={toggleSettingsNav}
            aria-label="Toggle Settings menu"
          >
            <IconMenu />
          </button>
        </div>
      </aside>
    </>
  );
};

export default SideNav;
