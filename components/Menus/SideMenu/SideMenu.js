import { useContext, useState, useRef } from "react";

import { useAuth } from "../../../contexts/auth";
import { useComms } from "../../../contexts/comms";
import { useSocket } from "../../../contexts/socket";
import { user } from "../../../contexts/auth";
import { updateHarthData } from "../../../requests/community";
import { Modal } from "../../Common";
import HarthEditModal from "../../HarthEditModal";
import HarthDeleteModal from "../HarthSettings/HarthDeleteModal";
import HarthLeaveModal from "../HarthSettings/HarthLeaveModal";

import { deleteHarthByID, leaveHarthByID } from "../../../requests/community";
import { MobileContext } from "../../../contexts/mobile";
import { SideModal } from "../../Common";
import SettingsMenu from "../AccountSettings";
import { HarthLogoLight } from "../../../public/images/harth-logo-light";
import { IconAdd } from "../../../resources/icons/IconAdd";
import { CustomHarthContextMenu } from "../../CustomHarthContextMenu/CustomHarthContextMenu";

import styles from "./SideMenu.module.scss";
import HarthList from "../HarthList/HarthList";

const SideNav = (props) => {
  const { menuOpen, onToggleMenu, setShowCreateHarthNameModal } = props;
  const [ShowSettingsNav, setShowSettingsNav] = useState(false);
  const [openEditHarthMenu, setOpenEditHarthMenu] = useState(null);
  const [showRenameHarthModal, setShowRenameHarthModal] = useState(false);
  const [showDeleteHarthModal, setShowDeleteHarthModal] = useState(false);
  const [showLeaveHarthModal, setShowLeaveHarthModal] = useState(false);

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
    console.log(newHarth);

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
    console.log(newHarth);
    await deleteHarthByID(newHarth._id);
    let msg = {};
    msg.updateType = "harth deleted";
    msg.comm = newHarth;
    emitUpdate(selectedcomm._id, msg, async (err, status) => {
      if (err) {
        console.log(err);
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
    console.log(newHarth);
    await leaveHarthByID({ harth: newHarth, user });
    let msg = {};
    msg.updateType = "harth deleted";
    msg.comm = newHarth;
    emitUpdate(selectedcomm._id, msg, async (err, status) => {
      if (err) {
        console.log(err);
      }
      setShowLeaveHarthModal(false);
      setOpenEditHarthMenu(null);
    });
  };

  if (isMobile) {
    return;
  }

  return (
    <>
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
      <aside
        id="left_nav"
        className={`${styles.SideNav} ${styles.Desktop}  ${
          menuOpen ? "active" : ""
        }`}
        ref={leftNav}
      >
        <div className={styles.titleHolder}>
          <button
            className={styles.SettingsButton}
            onClick={toggleSettingsNav}
            aria-label="Toggle Settings menu"
          >
            <HarthLogoLight />
          </button>
        </div>
        <HarthList
          comms={comms}
          selectedcomm={selectedcomm}
          unreadMsgs={unreadMessagesRef}
          toggleCreateComm={setShowCreateHarthNameModal}
          changeSelectedCom={changeSelectedCom}
          toggleHarthEditModal={toggleHarthEditModal}
        />
        <div className={styles.bottomHolder}>
          <button
            className={styles.addHarthButton}
            onClick={setShowCreateHarthNameModal}
          >
            <IconAdd />
          </button>
        </div>
      </aside>
    </>
  );
};

export default SideNav;

// import { useContext, useState, useRef } from "react";

// import { useAuth } from "../contexts/auth";
// import { useComms } from "../contexts/comms";
// import { useSocket } from "../contexts/socket";
// import { MobileContext } from "../contexts/mobile";
// import Modal from "./Modal";
// import SideModal from "./Common/SideModal";
// import SettingsMenu from "./SettingsMenu/index";
// import CommBuilder from "../pages/comm";

// const SideNav = (props) => {
//     const { toggleTavern, menuOpen, onToggleMenu } = props;
//     const [ShowCommBuilder, setShowCommBuilder] = useState(false);
//     const [ShowSettingsNav, setShowSettingsNav] = useState(false);
//     const { isMobile } = useContext(MobileContext);

//     const { comms, setComm, selectedcomm, setTopic } = useComms();
//     const { unreadMsgs } = useSocket();
//     const { user } = useAuth();

//     let leftNav = useRef();

//     const changeSelectedCom = (com) => {
//         toggleTavern(false);
//         setComm(com);
//         setTopic({});
//         onToggleMenu();
//     };
//     const toggleDefaultComm = () => {
//         setComm();
//         toggleTavern(true);
//     };
//     const toggleCreateComm = () => {
//         setShowCommBuilder(!ShowCommBuilder);
//     };
//     const toggleSettingsNav = () => {
//         setShowSettingsNav(!ShowSettingsNav);
//     };

//     const DisplayCommBuilder = () => {
//         if (ShowCommBuilder) {
//             return (
//                 <Modal onToggleModal={toggleCreateComm}>
//                     <CommBuilder />
//                 </Modal>
//             );
//         }
//         return null;
//     };
//     const DisplaySettingsNav = () => {
//         if (ShowSettingsNav) {
//             return (
//                 <SideModal onToggleModal={toggleSettingsNav}>
//                     <SettingsMenu />
//                 </SideModal>
//             );
//         }
//         return null;
//     };

//     return (
//         <>
//             <DisplayCommBuilder />
//             <DisplaySettingsNav />
//             <aside
//                 id="left_nav"
//                 className={`${isMobile ? "isMobile" : "isDesktop"} ${
//                     menuOpen ? "active" : ""
//                 }`}
//                 ref={leftNav}
//             >
//                 <ul
//                     id="left_nav_comms"
//                     // onMouseOver={expandMenu}
//                     // onMouseLeave={collapseMenu}
//                 >
//                     {isMobile ? (
//                         <p className="left_nav_title">Your H&auml;rths</p>
//                     ) : null}
//                     <li id="left_nav_comms_default" aria-label="nav-item">
//                         <button onClick={toggleDefaultComm}>
//                             <span className="comm-icon-wrapper">
//                                 <span className="comm-icon"></span>
//                             </span>
//                             <span className="comm-name">The Tavern</span>
//                         </button>
//                     </li>
//                     {comms &&
//                         comms.map((com) => {
//                             let classes = [];
//                             if (selectedcomm && com._id === selectedcomm._id) {
//                                 classes.push("active");
//                             } else {
//                                 unreadMsgs.forEach((msg) => {
//                                     if (
//                                         msg.comm_id === com._id &&
//                                         msg.creator_id !== user._id
//                                     ) {
//                                         classes.push("com-new-message");
//                                     }
//                                 });
//                             }

//                             return (
//                                 <li
//                                     className={classes.join(" ")}
//                                     aria-label="nav-item"
//                                     key={com?._id}
//                                 >
//                                     <button
//                                         onClick={() => {
//                                             changeSelectedCom(com);
//                                         }}
//                                         aria-label={com.name}
//                                         className={
//                                             com.iconKey ? "hasImage" : undefined
//                                         }
//                                     >
//                                         {com.iconKey ? (
//                                             <span className="comm-icon-wrapper">
//                                                 <img
//                                                     className="comm-icon"
//                                                     src={com.iconKey}
//                                                 />
//                                             </span>
//                                         ) : (
//                                             <span className="comm-icon-wrapper">
//                                                 <span className="comm-icon"></span>
//                                             </span>
//                                         )}
//                                         <span className="comm-name">
//                                             {com.name}
//                                         </span>
//                                     </button>
//                                 </li>
//                             );
//                         })}
//                     <li id="left_nav_comms_new" aria-label="nav-item">
//                         <button onClick={toggleCreateComm}>
//                             <span className="comm-name">new h&auml;rth</span>
//                         </button>
//                     </li>
//                 </ul>

//                 {isMobile ? (
//                     <SettingsMenu />
//                 ) : (
//                     <button
//                         onClick={toggleSettingsNav}
//                         aria-label="Toggle Settings menu"
//                         id="settings_toggle"
//                     ></button>
//                 )}
//             </aside>
//         </>
//     );
// };

// export default SideNav;
