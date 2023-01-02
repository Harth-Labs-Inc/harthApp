import { useState, useEffect, useContext } from "react";
import { MobileContext } from "../../../contexts/mobile";
import { BagButton } from "../Controls/BagButton";
import { CameraButton } from "../Controls/CameraButton";
import { ChatButton } from "../Controls/ChatButton";
import { LeaveButton } from "../Controls/LeaveButton";
import { MicButton } from "../Controls/MicButton";
import { MoreButton } from "../Controls/MoreButton";
import { StreamButton } from "../Controls/StreamButton";

import { Modal } from "../../Common";

import styles from "./gatheringControlBar.module.scss";

const GatherControlBar = (props) => {
    const { 
        roomType="party",
        onBagClick,
        onCameraClick,
        onChatClick,
        onLeaveClick, 
        onMicClick,
        onMicMoreClick,
        onCameraMoreClick,
        onStreamClick,
        videoOn,
        muteOn,
        
    } = props;
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

    const cameraToggle = () => {
        onCameraClick();
    }

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
                    {roomType == "party" && <BagButton onPress={onBagClick}/>}
                    {roomType != "voice" && <CameraButton onPress={onCameraClick} videoOn={videoOn}/>}
                    <MicButton onPress={onMicClick} />
                    {roomType != "voice" && <StreamButton onPress={onStreamClick} />}
                    <ChatButton onPress={onChatClick}/>

                </header>
            ) : (
                <header className={styles.desktop}>
                    
                    <div className={styles.leftGroup}>
                        <LeaveButton onPress={onLeaveClick}/>
                        {roomType == "party" && (<p className={styles.spacer}></p>)}                    

                    </div>

                    {roomType != "voice" 
                    ?
                        <div className={styles.middleGroup}>
                            <div className={styles.optionsContainer}>
                                <div className={styles.mainButton}><CameraButton onPress={onCameraClick} videoOn={videoOn}/></div>
                                <div className={styles.moreButton}><MoreButton onPress={onCameraMoreClick}/></div>
                            </div>
                            <div className={styles.optionsContainer}>
                                <div className={styles.mainButton}><MicButton onPress={onMicClick} muteOn={muteOn}/></div>
                                <div className={styles.moreButton}><MoreButton onPress={onMicMoreClick}/></div>
                            </div>
                        <StreamButton onPress={onStreamClick} />
                        </div>
                    :
                        <div className={styles.optionsContainer}>
                            <div className={styles.mainButton}><MicButton onPress={onMicClick}/></div>
                            <div className={styles.moreButton}><MoreButton onPress={onMicMoreClick}/></div>
                        </div>
                    }
                    
                    <div className={styles.rightGroup}>
                        {roomType == "voice" && (<p className={styles.spacer}></p>)}                    
                        
                        {roomType == "party" && <BagButton onPress={onBagClick} size="small"/>}
                        
                        {roomType != "voice" && <ChatButton onPress={onChatClick} size="small"/>}   


                    </div>

                    

                </header>
            )}
        </>
            );
};

export default GatherControlBar;
