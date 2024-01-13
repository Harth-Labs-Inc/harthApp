import { useContext, useState, useEffect, useRef } from "react";
import { MobileContext } from "../../contexts/mobile";
import SideNav from "../Menus/SideMenu/SideMenu";
import TopBar from "../Menus/TopBar/TopBar";
import MainNav from "../MainNav/MainNav";
import { TransitionGroup, CSSTransition } from "react-transition-group";
import MobileSideNav from "../Menus/SideMenu/MobileSideMenu";
import dynamic from "next/dynamic";
import styles from "./DashboardLayout.module.scss";
import { useVideo } from "contexts/video";
import { useAuth } from "contexts/auth";
import { useComms } from "contexts/comms";
import { useSocket } from "contexts/socket";
import { Modal } from "Common";
import TermsOfServiceModal from "components/TermsOfServiceModal/TermsOfServiceModal";
import { updateUser } from "../../requests/userApi";
import { useTourManager } from "contexts/tour";

const Party = dynamic(() => import("../../pages/dashboard/party/index"), {
  loading: () => null,
});
const Stream = dynamic(() => import("../../pages/dashboard/stream/index"), {
  loading: () => null,
});
const Voice = dynamic(() => import("../../pages/dashboard/voice/index"), {
  loading: () => null,
});

const dynamicRoom = {
  stream: Stream,
  voice: Voice,
  party: Party,
};

const DashboardLayout = (props) => {
  const [menuActive, setmenuActive] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(null);
  const { isMobile } = useContext(MobileContext);

  const { activeTour, startTour, endTour, lastStepIndex } = useTourManager();

  const {
    changePage,
    children,
    currentPage,
    setShowCreateHarthNameModal,
    toggleNoHarthDetected,
    shouldSkipPageAnimation,
  } = props;

  const {
    grabTopics,
    selectedcomm,
    resetConversations,
    fetchConversations,
    resetTopics,
    forceHarthCreation,
    activeRoom,
    closeActiveRoomFromMobile,
    minimizeHandler,
    hasRoomMinimized,
    showTermsOfServiceModal,
    approvedTosHandler,
    hasFinishedFirstUseTour,
    hasApprovedTos,
    initialLoadAllGood,
    showAdminPromotionModal,
  } = useComms();
  const { getInitialCallRooms, socketID, callRooms } = useVideo();
  const { user } = useAuth();
  const {
    mainAlertsRef,
    setMainAlertsFromChild,
    showHasUpdateButton,
    setShowHasUpdateButton,
  } = useSocket();

  const prePageRef = useRef("");
  const backgroundColorClass = useRef("defaultTransitionBackground");

  useEffect(() => {
    prePageRef.current = currentPage;
  }, [currentPage]);

  useEffect(() => {
    if (
      socketID &&
      selectedcomm &&
      selectedcomm.users &&
      user &&
      currentPage !== "gather"
    ) {
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
  }, [socketID, selectedcomm?._id, currentPage]);

  useEffect(() => {
    if (selectedcomm) {
      if (callRooms?.length > 0) {
        let alerts = mainAlertsRef[selectedcomm?._id] || {};
        if (!alerts.gather || !alerts.gather.hasLive) {
          alerts.gather = { ...(alerts.gather || {}), hasLive: true };
          setMainAlertsFromChild({
            ...mainAlertsRef,
            [selectedcomm?._id]: alerts,
          });
        }
      }
      if (callRooms?.length == 0) {
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
    if (
      initialLoadAllGood &&
      hasApprovedTos &&
      !hasFinishedFirstUseTour &&
      mobileMenuOpen != null &&
      isMobile
    ) {
      if (lastStepIndex == 0) {
        if (mobileMenuOpen && activeTour) {
          endTour();
        } else {
          startTour("fisrtUse", 1);
        }
      }
    }
  }, [
    mobileMenuOpen,
    hasApprovedTos,
    hasFinishedFirstUseTour,
    isMobile,
    initialLoadAllGood,
  ]);

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
  const updateCacheWithReload = (e) => {
    e.stopPropagation();
    window.location.reload();
  };
  const updateCacheWithoutReload = (e) => {
    e.stopPropagation();
    setShowHasUpdateButton(false);
  };
  const updateTos = async () => {
    const { data } = await updateUser({
      userIdForUpdate: user._id,
      update: { termsOfServiceApproved: true },
    });
    if (data.ok && data.updatedUser) {
      approvedTosHandler();
    }
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

    const ComponentToRender = activeRoom
      ? dynamicRoom[activeRoom.room_type]
      : null;

    return (
      <>
        {showTermsOfServiceModal ? (
          <Modal onToggleModal={() => {}}>
            <TermsOfServiceModal
              buttonText="I Agree"
              submitHandler={updateTos}
              isSubmitting={false}
              includeWelcome={true}
            />
          </Modal>
        ) : null}

        {showAdminPromotionModal ? (
          <div className={styles.updateMain}>
            <div className={styles.buttonwrapper}>
              <div className={styles.button}>
                <p>
                  Alert!!<br/><br/>

                The previous Owner has left the group and you have been promoted to the group Owner.
                </p>
                <div className={styles.updateContainer}></div>
              </div>
              <div className={styles.buttonbg}></div>
            </div>
          </div>
        ) : null}
        {showHasUpdateButton ? (
          <div className={styles.updateMain}>
            <div className={styles.buttonwrapper}>
              <div className={styles.button}>
                <p>Update available!</p>
                <div className={styles.updateContainer}>
                  <button
                    className={styles.UpdateLater}
                    onClick={updateCacheWithoutReload}
                  >
                    Update Later
                  </button>
                  <button
                    className={styles.UpdateNow}
                    onClick={updateCacheWithReload}
                  >
                    Update Now
                  </button>
                </div>
              </div>
              <div className={styles.buttonbg}></div>
            </div>
          </div>
        ) : null}
        {activeRoom && (
          <div
            key={activeRoom.room_id}
            className={`${styles.mobileRoomContainer} ${
              hasRoomMinimized ? styles.minimized : ""
            }`}
          >
            <ComponentToRender
              closeActiveRoomFromMobile={closeActiveRoomFromMobile}
              minimizeHandler={minimizeHandler}
              activeRoom={activeRoom}
            />
          </div>
        )}
        <main className={styles.Dashboard}>
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
                  timeout={shouldSkipPageAnimation ? 0 : 200}
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
      </>
    );
  }

  return (
    <>
      {showTermsOfServiceModal ? (
        <Modal onToggleModal={() => {}}>
          <TermsOfServiceModal
            buttonText="I Agree"
            submitHandler={updateTos}
            isSubmitting={false}
            includeWelcome={true}
          />
        </Modal>
      ) : null}
      <main className={styles.Dashboard}>
        {showAdminPromotionModal ? (
          <div className={styles.updateMain}>
            <div className={styles.buttonwrapper}>
              <div className={styles.button}>
                <p>
                  Alert!!<br/><br/>

                The previous Owner has left the group and you have been promoted to the group Owner.
                </p>
                <div className={styles.updateContainer}></div>
              </div>
              <div className={styles.buttonbg}></div>
            </div>
          </div>
        ) : null}
        {showHasUpdateButton ? (
          <div className={styles.updateMain}>
            <div className={styles.buttonwrapper}>
              <div className={styles.content}>
                <p>Update available!</p>
                <div className={styles.updateContainer}>
                  <button
                    className={styles.UpdateLater}
                    onClick={updateCacheWithoutReload}
                  >
                    Update Later
                  </button>
                  <button
                    className={styles.UpdateNow}
                    onClick={updateCacheWithReload}
                  >
                    Update Now
                  </button>
                </div>
              </div>
              <div className={styles.buttonbg}></div>
            </div>
          </div>
        ) : null}
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
    </>
  );
};

export default DashboardLayout;
