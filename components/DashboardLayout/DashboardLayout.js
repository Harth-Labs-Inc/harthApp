import { useContext, useState, useEffect, useRef } from "react";
import { MobileContext } from "../../contexts/mobile";
import SideNav from "../Menus/SideMenu/SideMenu";
import TopBar from "../Menus/TopBar/TopBar";
import MainNav from "../MainNav/MainNav";
import { TransitionGroup, CSSTransition } from "react-transition-group";

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

  const prePageRef = useRef("");
  const backgroundColorClass = useRef("defaultTransitionBackground");

  useEffect(() => {
    const setVhVariable = () => {
      let vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };

    setVhVariable();

    window.addEventListener("resize", setVhVariable);

    return () => window.removeEventListener("resize", setVhVariable);
  }, []);

  useEffect(() => {
    prePageRef.current = currentPage;
  }, [currentPage]);

  useEffect(() => {
    if (socketID && selectedcomm && selectedcomm.users && user) {
      let creator = selectedcomm.users?.find((usr) => usr.userId === user._id);
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

  const toggleMenu = () => {
    if (isMobile) {
      setMobileMenuOpen((prevState) => !prevState);
    } else {
      setmenuActive((prevState) => !prevState);
    }
  };
  const changePageHandler = (pg) => {
    if (pg === "message") {
      resetTopics();
      fetchConversations(selectedcomm._id);
    }
    if (pg === "chat") {
      grabTopics(selectedcomm._id);
      resetConversations();
    }
    if (pg === "gather") {
      resetTopics();
      resetConversations();
    }
    changePage(pg);
  };

  if (isMobile) {
    let previous = prePageRef.current;
    let direction = "left";
    if (previous !== currentPage) {
      if (currentPage == "chat") {
        direction = "right";
      }
      if (currentPage == "message") {
        direction = "left";
      }
      if (currentPage == "gather") {
        if (previous == "chat") {
          direction = "left";
        }
        if (previous == "message") {
          direction = "right";
        }
      }
      if (previous == "gather") {
        backgroundColorClass.current = "gatherTransitionBackground";
      }
      if (previous == "message") {
        backgroundColorClass.current = "messageTransitionBackground";
      }
      if (previous == "chat") {
        backgroundColorClass.current = "chatTransitionBackground";
      }
    }

    return (
      <main className={styles.Dashboardmobile}>
        <MobileSideNav
          mobileMenuOpen={mobileMenuOpen}
          onToggleMenu={toggleMenu}
          setShowCreateHarthNameModal={setShowCreateHarthNameModal}
          changePage={changePageHandler}
          toggleNoHarthDetected={toggleNoHarthDetected}
        />

        <div className={styles.DashboardContent}>
          <TopBar
            currentPage={currentPage}
            changePage={changePageHandler}
            onToggleMenu={toggleMenu}
          ></TopBar>
          <div className={backgroundColorClass.current}>
            <TransitionGroup>
              <CSSTransition
                key={currentPage}
                classNames={direction == "right" ? "slideRight" : "slideLeft"}
                timeout={200}
              >
                <section
                  className={`${styles.DashboardContentWrapper} ${styles.Mobile}`}
                  id="content_wrapper"
                >
                  {children}
                </section>
              </CSSTransition>
            </TransitionGroup>
          </div>

          <MainNav
            onToggleMenu={toggleMenu}
            changePage={changePageHandler}
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
            changePage={changePageHandler}
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
