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
                        <div style={{ height: 24, width: 24, position: "relative",}}>
                                <IconChatNoFill />
                                {hasAlert ? (
                                    <div
                                        className={
                                            styles.MainNavPageButtonAlertIndicator
                                        }
                                    />
                                ) : null}
                        </div>
                        <div>Chat</div>
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
                        <div style={{ height: 24, width: 24, position: "relative" }}>
                                <IconFireNoFill />
                                {hasAlert ? (
                                    <div
                                        className={
                                            styles.MainNavPageButtonAlertIndicator
                                        }
                                    />
                                ) : null}
                        </div>
                        <div>Gather</div>
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
                        <div style={{ height: 24, width: 24, position: "relative" }}>
                                <IconForumNoFill />
                                {hasAlert ? (
                                    <div
                                        className={
                                            styles.MainNavPageButtonAlertIndicator
                                        }
                                    />
                                ) : null}
                        </div>
                        <div>Message</div>
                    </button>
                </div>
            </header>

        </>
    );
};

export default MainNav;
