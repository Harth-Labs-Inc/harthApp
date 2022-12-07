import { useState, useEffect, useContext } from "react";
import { MobileContext } from "../../../contexts/mobile";
import { BagButton } from "../Controls/BagButton";
import { CameraButton } from "../Controls/CameraButton";
import { ChatButton } from "../Controls/ChatButton";
import { LeaveButton } from "../Controls/LeaveButton";
import { MicButton } from "../Controls/MicButton";
import { MoreButton } from "../Controls/MoreButton";
import { StreamButton } from "../Controls/StreamButton";

import Modal from "../../Modal";

import styles from "./GatherControlBar.module.scss";

const GatherControlBar = (props) => {
    const { roomType="party" } = props;
    const [modal, setModal] = useState();
    const { isMobile } = useContext(MobileContext);

    // const handleHarthMenu = () => {
    //     if (!isMobile) {
    //         setModal(!modal);
    //     }
    //     if (isMobile) {
    //         setModal(!modal);
    //     }
    // };

    const showModal = () => {
        setModal(!modal);
    };


    return (
        <>
            {modal ? (
                <Modal show={modal} onToggleModal={showModal}>
                    <div>something</div>
                </Modal>
            ) : (
                ""
            )}

            {isMobile ? (
                <header className={styles.mobile}>
                    {roomType == "voice" && <div className={styles.leftSpace} />}
                    {roomType == "party" && <BagButton />}
                    {roomType != "voice" && <CameraButton />}
                    <MicButton />
                    {roomType != "voice" && <StreamButton />}
                    <ChatButton />

                </header>
            ) : (
                <header className={styles.desktop}>
                    
                    <div className={styles.leftGroup}><LeaveButton /></div>

                    {roomType != "voice" 
                    ?
                        <div className={styles.middleGroup}>
                            <div className={styles.optionsContainer}>
                                <div className={styles.mainButton}><CameraButton /></div>
                                <div className={styles.moreButton}><MoreButton /></div>
                            </div>
                            <div className={styles.optionsContainer}>
                                <div className={styles.mainButton}><MicButton /></div>
                                <div className={styles.moreButton}><MoreButton /></div>
                            </div>
                        <StreamButton />
                        </div>
                    :
                        <div className={styles.optionsContainer}>
                            <div className={styles.mainButton}><MicButton /></div>
                            <div className={styles.moreButton}><MoreButton /></div>
                        </div>
                    }
                    
                    <div className={styles.rightGroup}>
                        {roomType == "party" && <BagButton size="small"/>}
                        {roomType != "voice" && <ChatButton size="small"/>}                       
                    </div>

                    {roomType == "voice" && <div className={styles.rightSpace} />}

                </header>
            )}
        </>
            );
};

export default GatherControlBar;
