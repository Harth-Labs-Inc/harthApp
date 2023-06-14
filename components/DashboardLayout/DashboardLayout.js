import { useContext, useState, useEffect } from "react";
import { MobileContext } from "../../contexts/mobile";
import SideNav from "../Menus/SideMenu/SideMenu";
import TopBar from "../Menus/TopBar/TopBar";
import MainNav from "../MainNav/MainNav";

import MobileSideNav from "../Menus/SideMenu/MobileSideMenu";

import styles from "./DashboardLayout.module.scss";
import { useVideo } from "contexts/video";
import { useAuth } from "contexts/auth";
import { useComms } from "contexts/comms";
import { useSocket } from "contexts/socket";

const DashboardLayout = (props) => {
  const [menuActive, setmenuActive] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isMobile } = useContext(MobileContext);

  const {
    changePage,
    children,
    currentPage,
    setShowCreateHarthNameModal,
    toggleNoHarthDetected,
  } = props;

  const {
    grabTopics,
    selectedcomm,
    resetConversations,
    fetchConversations,
    resetTopics,
    forceHarthCreation,
  } = useComms();
  const { getInitialCallRooms, socketID, callRooms } = useVideo();
  const { user } = useAuth();
  const { mainAlertsRef, setMainAlertsFromChild } = useSocket();

  // useEffect(() => {
  //   const handleContextMenu = (event) => {
  //     event.preventDefault();
  //   };

  //   document.addEventListener("contextmenu", handleContextMenu);

  //   return () => {
  //     document.removeEventListener("contextmenu", handleContextMenu);
  //   };
  // }, []);

  useEffect(() => {
    if (socketID && selectedcomm && user) {
      let creator = selectedcomm.users.find((usr) => usr.userId === user._id);
      if (creator) {
        let data = {};
        data.icon = creator.iconKey;
        data.name = creator.name;
        data.harthid = selectedcomm._id;
        data.socketId = socketID;
        data.harthName = selectedcomm.name;
        getInitialCallRooms(data);
      }
    }
  }, [socketID, selectedcomm, user]);

  useEffect(() => {
    if (selectedcomm) {
      if (callRooms?.length > 0 && currentPage !== "gather") {
        let alerts = mainAlertsRef[selectedcomm?._id] || {};
        if (!alerts.gather || !alerts.gather.hasLive) {
          alerts.gather = { ...(alerts.gather || {}), hasLive: true };
          setMainAlertsFromChild({
            ...mainAlertsRef,
            [selectedcomm?._id]: alerts,
          });
        }
      }
      if (callRooms?.length == 0 && currentPage !== "gather") {
        let alerts = mainAlertsRef[selectedcomm?._id] || {};
        if (alerts?.gather?.hasLive) {
          alerts.gather = { ...alerts?.gather, hasLive: false };
          setMainAlertsFromChild({
            ...mainAlertsRef,
            [selectedcomm?._id]: alerts,
          });
        }
      }
    }
  }, [callRooms, mainAlertsRef, selectedcomm]);

  useEffect(() => {
    if (forceHarthCreation) {
      setShowCreateHarthNameModal(true);
    }
  }, [forceHarthCreation]);

  useEffect(() => {
    if (selectedcomm) {
      if (currentPage === "message") {
        resetTopics();
        fetchConversations();
      }
      if (currentPage === "chat") {
        grabTopics(selectedcomm._id);
        resetConversations();
      }
      if (currentPage === "gather") {
        resetTopics();
        resetConversations();
      }
    }
  }, [currentPage, selectedcomm]);

  const toggleMenu = () => {
    if (isMobile) {
      setMobileMenuOpen((prevState) => !prevState);
    } else {
      setmenuActive((prevState) => !prevState);
    }
  };

  if (isMobile) {
    return (
      <main className={styles.Dashboard}>
        <MobileSideNav
          mobileMenuOpen={mobileMenuOpen}
          onToggleMenu={toggleMenu}
          setShowCreateHarthNameModal={setShowCreateHarthNameModal}
          changePage={changePage}
          toggleNoHarthDetected={toggleNoHarthDetected}
        />

        <div className={styles.DashboardContent}>
          <TopBar
            currentPage={currentPage}
            changePage={changePage}
            onToggleMenu={toggleMenu}
          ></TopBar>
          <section
            className={`${styles.DashboardContentWrapper} ${styles.Mobile}`}
            id="content_wrapper"
          >
            {children}
          </section>
          <MainNav
            onToggleMenu={toggleMenu}
            changePage={changePage}
            currentPage={currentPage}
          />
        </div>
      </main>
    );
  }

  return (
    <main className={styles.Dashboard}>
      <SideNav
        menuOpen={menuActive}
        onToggleMenu={toggleMenu}
        setShowCreateHarthNameModal={setShowCreateHarthNameModal}
        toggleNoHarthDetected={toggleNoHarthDetected}
      />
      <div className={styles.DashboardContent}>
        <TopBar currentPage={currentPage}>
          <MainNav
            onToggleMenu={toggleMenu}
            changePage={changePage}
            currentPage={currentPage}
          />
        </TopBar>
        <section
          className={`${styles.DashboardContentWrapper} ${styles.Desktop}`}
          id="content_wrapper"
        >
          {children}
        </section>
      </div>
    </main>
  );
};

export default DashboardLayout;
