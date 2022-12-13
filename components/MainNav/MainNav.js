import { useState, useEffect, useContext } from "react";
import { MobileContext } from "../../contexts/mobile";
import { IconChatNoFill } from "../../resources/icons/IconChatNoFill";
import { IconChatFill } from "../../resources/icons/IconChatFill";
import { IconFireNoFill } from "../../resources/icons/IconFireNoFill";
import { IconFireFill } from "../../resources/icons/IconFireFill";
import { IconForumNoFill } from "../../resources/icons/IconForumNoFill";
import Modal from "../Common/Modals/Modal";
import HarthSettings from "../Menus/HarthSettings/HarthSettings";
import { useComms } from "../../contexts/comms";

import styles from "./mainNav.module.scss";

const harthIcon =
    "https://d1mc7wmz9xfkdm.cloudfront.net/eyJidWNrZXQiOiJhc3NldHMud29vZGxhbmRkaXJlY3QuY29tIiwia2V5IjoicHJvZHVjdC1pbWFnZXMvUGV0ZXJzb24tUmVhbC1GeXJlLVJ1c3RpYy1PYWstVmVudGVkLUdhcy1Mb2ctU2V0LW1haW4uanBnIiwiZWRpdHMiOnsicmVzaXplIjp7IndpZHRoIjoxMjAwLCJoZWlnaHQiOjEyMDAsImZpdCI6ImNvbnRhaW4iLCJiYWNrZ3JvdW5kIjp7InIiOjI1NSwiZyI6MjU1LCJiIjoyNTUsImFscGhhIjoxfX19fQ==";

const profileIcon =
    "https://thehill.com/wp-content/uploads/sites/2/2022/11/f026baa605674c8d92f28b0c1855cd8e.jpg";

const MainNav = (props) => {
    const { changePage, currentPage, onToggleMenu } = props;
    const [modal, setModal] = useState();

    const { isMobile } = useContext(MobileContext);
    const { selectedcomm } = useComms();

    //alert needs logic
    //this is just a universal setting that makes all
    //the tabs show their alert.
    const hasAlert = true;

    const handleHarthMenu = () => {
        console.log("handleHarthMenu");
        if (!isMobile) {
            setModal(!modal);
        }
        if (isMobile) {
            onToggleMenu();
        }
    };

    const showModal = () => {
        setModal(!modal);
    };

    console.log(isMobile, modal);

    return (
        <>
            {modal ? (
                <Modal show={modal} onToggleModal={showModal}>
                    <HarthSettings
                        communityName={selectedcomm?.name}
                        communityId={selectedcomm?._id}
                        onToggleModal={showModal}
                    />
                </Modal>
            ) : (
                ""
            )}

            <header
                className={`${styles.MainNav} ${
                    isMobile ? styles.Mobile : styles.Desktop
                }`}
            >
                {isMobile ? (
                    <button
                        className={styles.MainNavHarthButton}
                        onClick={handleHarthMenu}
                        aria-label="Current Harth"
                    >
                        <img
                            className={styles.MainNavHarthButtonImage}
                            src={harthIcon}
                        />
                    </button>
                ) : (
                    <div style={{ width: 240 }}>
                        <button
                            className={styles.MainNavHarthButton}
                            onClick={handleHarthMenu}
                            aria-label="Current Harth"
                        >
                            {selectedcomm?.name}
                        </button>
                    </div>
                )}

                <div className={styles.MainNavPages}>
                    <button
                        role="nav-item"
                        id="chat"
                        aria-label="Community Chat"
                        className={`
                            ${styles.MainNavPageButton} 
                            ${
                                currentPage === "chat"
                                    ? styles.Active
                                    : styles.Inactive
                            } 
                        `}
                        onClick={() => {
                            changePage("chat");
                        }}
                    >
                        <div style={{ height: 24, width: 24, margin: 0 }}>
                            {currentPage === "chat" ? (
                                <IconChatFill />
                            ) : (
                                <IconChatNoFill />
                            )}
                        </div>
                        <div>Chat</div>
                        {hasAlert ? (
                            <div
                                className={
                                    styles.MainNavPageButtonAlertIndicator
                                }
                            />
                        ) : null}
                    </button>

                    <button
                        role="nav-item"
                        id="gather"
                        aria-label="Gather"
                        className={`
                            ${styles.MainNavPageButton} 
                            ${
                                currentPage == "gather"
                                    ? styles.Active
                                    : styles.Inactive
                            } 
                        `}
                        onClick={() => {
                            changePage("gather");
                        }}
                    >
                        <div style={{ height: 24, width: 24, marginRight: 6 }}>
                            {currentPage === "gather" ? (
                                <IconFireFill />
                            ) : (
                                <IconFireNoFill />
                            )}
                        </div>
                        <div>Gather</div>
                        {hasAlert ? (
                            <div
                                className={
                                    styles.MainNavPageButtonAlertIndicator
                                }
                            />
                        ) : null}
                    </button>

                    <button
                        role="nav-item"
                        id="message"
                        aria-label="Private Messages"
                        className={`
                            ${styles.MainNavPageButton} 
                            ${
                                currentPage == "message"
                                    ? styles.Active
                                    : styles.Inactive
                            } 
                        `}
                        onClick={() => {
                            changePage("message");
                        }}
                    >
                        <div style={{ height: 24, width: 24, marginRight: 6 }}>
                            {currentPage === "message" ? (
                                <IconForumNoFill />
                            ) : (
                                <IconForumNoFill />
                            )}
                        </div>
                        <div>Message</div>
                        {hasAlert ? (
                            <div
                                className={
                                    styles.MainNavPageButtonAlertIndicator
                                }
                            />
                        ) : null}
                    </button>
                </div>
            </header>

            {/* isMobile ? (
                <header className={styles.mobile}>
                    <button
                        className={styles.harthButton}
                        onClick={handleHarthMenu}
                        aria-label="Current Harth"
                    >
                        <img className={styles.harthImage} src={harthIcon} />
                    </button>
                    <button
                        role="nav-item"
                        id="chat"
                        aria-label="Community Chat"
                        className={`
                            ${styles.navButton} 
                            ${
                                currentPage == "chat"
                                    ? styles.navButtonActive
                                    : styles.navButtonInactive
                            } 
                        `}
                        onClick={() => {
                            changePage("chat");
                        }}
                    >
                        <div className={styles.indicator}></div>
                        <div style={{ height: 24, width: 24, margin: 0 }}>
                            <IconChatNoFill />
                        </div>
                        <div>Chat</div>
                        {hasAlert ? (
                            <div className={styles.alertIndicator} />
                        ) : null}
                    </button>

                    <button
                        role="nav-item"
                        id="gather"
                        aria-label="Gather"
                        className={`
                            ${styles.navButton} 
                            ${
                                currentPage == "gather"
                                    ? styles.navButtonActive
                                    : styles.navButtonInactive
                            } 
                        `}
                        onClick={() => {
                            changePage("gather");
                            // remove page change on mobile for now
                            //if (!isMobile) {
                            //  changePage('gather')
                            //} else {
                            //  alert('mobile gatherings coming soon')
                            //}
                        }}
                    >
                        <div className={styles.indicator}></div>
                        <div style={{ height: 24, width: 24, marginRight: 6 }}>
                            <IconFireNoFill />
                        </div>
                        <div>Gather</div>
                        {hasAlert ? (
                            <div className={styles.alertIndicator} />
                        ) : null}
                    </button>

                    <button
                        role="nav-item"
                        id="message"
                        aria-label="Private Messages"
                        className={`
                            ${styles.navButton} 
                            ${
                                currentPage == "message"
                                    ? styles.navButtonActive
                                    : styles.navButtonInactive
                            } 
                        `}
                        onClick={() => {
                            changePage("message");
                        }}
                    >
                        <div className={styles.indicator}></div>
                        <div style={{ height: 24, width: 24, marginRight: 6 }}>
                            <IconForumNoFill />
                        </div>
                        <div>Message</div>
                        {hasAlert ? (
                            <div className={styles.alertIndicator} />
                        ) : null}
                    </button>
                </header>
            ) : (
                <header className={styles.desktop}>
                    <div style={{ width: 240 }}>
                        <button
                            className={styles.harthButton}
                            onClick={handleHarthMenu}
                            aria-label="Current Harth"
                        >
                            {selectedcomm.name}
                        </button>
                    </div>

                    <div role="nav" className={styles.topButtons}>
                        <button
                            role="nav-item"
                            id="chat"
                            aria-label="Community Chat"
                            className={`
                            ${styles.navButton} 
                            ${
                                currentPage == "chat"
                                    ? styles.navButtonActive
                                    : styles.navButtonInactive
                            } 
                        `}
                            onClick={() => {
                                changePage("chat");
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    alignItems: "center",
                                }}
                            >
                                <div className={styles.iconHolder}>
                                    <IconChatNoFill />
                                    {(hasAlert & !(currentPage == "chat"))
                                    ?
                                    (<div className={styles.alertIndicator} />)
                                    :null
                                    }
                                </div>
                                <div>Chat</div>
                            </div>
                            <div className={styles.indicator}></div>
                        </button>

                        <button
                            role="nav-item"
                            id="gather"
                            aria-label="Gather"
                            className={`
                                ${styles.navButton} 
                                ${
                                    currentPage == "gather"
                                        ? styles.navButtonActive
                                        : styles.navButtonInactive
                                } 
                            `}
                            onClick={() => {
                                changePage("gather");
                                // remove page change on mobile for now
                                //if (!isMobile) {
                                //  changePage('gather')
                                //} else {
                                //  alert('mobile gatherings coming soon')
                                //}
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    alignItems: "center",
                                }}
                            >
                                <div className={styles.iconHolder}>
                                    <IconFireNoFill />
                                    {(hasAlert & !(currentPage == "gather"))
                                    ?
                                    (<div className={styles.alertIndicator} />)
                                    :null
                                    }
                                </div>
                                <div>Gather</div>
                            </div>
                            <div className={styles.indicator}></div>
                        </button>

                        <button
                            role="nav-item"
                            id="message"
                            aria-label="Private Messages"
                            className={`
                                ${styles.navButton} 
                                ${
                                    currentPage == "message"
                                        ? styles.navButtonActive
                                        : styles.navButtonInactive
                                } 
                            `}
                            onClick={() => {
                                changePage("message");
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    alignItems: "center",
                                }}
                            >
                                <div className={styles.iconHolder}>
                                    <IconForumNoFill />
                                    {(hasAlert & !(currentPage == "message"))
                                    ?
                                    (<div className={styles.alertIndicator} />)
                                    :null
                                    }
                                    
                                </div>
                                <div>Message</div>
                            </div>
                            <div className={styles.indicator}></div>
                        </button>
                    </div>

                    <Avatar
                        aLabel="My Account"
                        isPressable={true}
                        onPress={showModal}
                        picSize={36}
                        imageSrc={profileIcon}
                    />
                </header>
            ) */}
        </>
    );
};

export default MainNav;
