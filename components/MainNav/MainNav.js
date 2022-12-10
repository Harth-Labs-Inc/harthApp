import { useState, useEffect, useContext } from "react";
import { useAuth } from "../../contexts/auth";
import { MobileContext } from "../../contexts/mobile";
import { IconChatNoFill } from "../../resources/icons/IconChatNoFill";
import { IconFireNoFill } from "../../resources/icons/IconFireNoFill";
import { IconForumNoFill } from "../../resources/icons/IconForumNoFill";
import { Avatar } from "../Common/Avatar/Avatar";
import Modal from "../Modal";
import HarthMenu from "../HarthMenu/index";
import { useComms } from "../../contexts/comms";

import styles from "./mainNav.module.scss";

const MainNav = (props) => {
    const { changePage, currentPage, onToggleMenu } = props;
    const [modal, setModal] = useState();
    const [communityName, setCommunityName] = useState();
    // const communityName = "Blarg";
    const [communityId, setCommunityId] = useState();
    // const [harthIcon, setHarthIcon] = useState()
    const harthIcon =
        "https://d1mc7wmz9xfkdm.cloudfront.net/eyJidWNrZXQiOiJhc3NldHMud29vZGxhbmRkaXJlY3QuY29tIiwia2V5IjoicHJvZHVjdC1pbWFnZXMvUGV0ZXJzb24tUmVhbC1GeXJlLVJ1c3RpYy1PYWstVmVudGVkLUdhcy1Mb2ctU2V0LW1haW4uanBnIiwiZWRpdHMiOnsicmVzaXplIjp7IndpZHRoIjoxMjAwLCJoZWlnaHQiOjEyMDAsImZpdCI6ImNvbnRhaW4iLCJiYWNrZ3JvdW5kIjp7InIiOjI1NSwiZyI6MjU1LCJiIjoyNTUsImFscGhhIjoxfX19fQ==";

    //const [profileIcon, setProfileIcon] = useState()
    //update with logic for image pull
    const profileIcon =
        "https://thehill.com/wp-content/uploads/sites/2/2022/11/f026baa605674c8d92f28b0c1855cd8e.jpg";

    const { isMobile } = useContext(MobileContext);
    const { user } = useAuth();
    const { comms, setComm, selectedcomm } = useComms();

    //alert needs logic
    //this is just a universal setting that makes all
    //the tabs show their alert.
    const hasAlert = true;

    const handleHarthMenu = () => {
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

    useEffect(() => {
        if (selectedcomm) {
            setCommunityName(selectedcomm.name);
            setCommunityId(selectedcomm._id);
            // setHarthIcon(selectedcomm.iconKey);
            selectedcomm.users.forEach((usr) => {
                if (usr.userId === user._id) {
                    // setProfileIcon(usr.iconKey);
                }
            });
        }
    }, [selectedcomm]);

    useEffect(() => {
        if (!selectedcomm && comms && comms.length > 0) {
            setComm(comms[0]);
        }
    }, [comms]);

    return (
        <>
            {modal ? (
                <Modal show={modal} onToggleModal={showModal}>
                    <HarthMenu
                        communityName={communityName}
                        communityId={communityId}
                        onToggleModal={showModal}
                    />
                </Modal>
            ) : (
                ""
            )}

            {isMobile ? (
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
                            ${currentPage == "chat" ? styles.navButtonActive : styles.navButtonInactive} 
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
                            ${currentPage == "gather" ? styles.navButtonActive : styles.navButtonInactive} 
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
                            ${currentPage == "message" ? styles.navButtonActive : styles.navButtonInactive} 
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
                            {communityName}
                        </button>
                    </div>

                    <div role="nav" className={styles.topButtons}>
                        <button
                            role="nav-item"
                            id="chat"
                            aria-label="Community Chat"
                            className={`
                            ${styles.navButton} 
                            ${currentPage == "chat" ? styles.navButtonActive : styles.navButtonInactive} 
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
                                    {hasAlert && (<div className={styles.alertIndicator} />)}
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
                                ${currentPage == "gather" ? styles.navButtonActive : styles.navButtonInactive} 
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
                                    {hasAlert && (<div className={styles.alertIndicator} />)}
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
                                ${currentPage == "message" ? styles.navButtonActive : styles.navButtonInactive} 
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
                                    {hasAlert && (<div className={styles.alertIndicator} />)}
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
            )}
        </>
    );
};

export default MainNav;
