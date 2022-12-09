import { useState, useEffect, useContext } from "react";
import { useAuth } from "../../../contexts/auth";
import { MobileContext } from "../../../contexts/mobile";
import { IconVolumeUpFill } from "../../../resources/icons/IconVolumeUpFill";
import { VolumeButton } from "./VolumeButton";
import { MuteProfileButton } from "./MuteProfileButton";
import { IconMuteIncoming } from '../../../resources/icons/IconMuteIncoming';
import { Avatar } from '../../Common/Avatar/Avatar';



import styles from './profileContainer.module.scss';

const ProfileContainer= (props) => {
    const { userInfo } = props; //whatever you need to pass
    const [hasVolumePanel, setHasVolumePanel] = useState(false);
    const [isVolumeExpanded, setIsVolumeExpanded] = useState(false);
    const { isMobile } = useContext(MobileContext);


    //shows the streaming label for app streaming, not webcam
    const [isStreaming, setIsStreaming] = useState(false);

    //if they are broadcasting webcam,
    const [hasWebcam, setHasWebcam] = useState(false);

    //speaking indicator 
    const [isSpeaking, setIsSpeaking] = useState(false);

    //if moted
    const [isMuted, setIsMuted] = useState(false);


    
    //const [profileName, setProfileName] = useState()
    //update with logic for profile name pull
    const profileName ="themadchiller";
    
    //const [profileIcon, setProfileIcon] = useState()
    //update with logic for image pull
    const profileIcon ="https://thehill.com/wp-content/uploads/sites/2/2022/11/f026baa605674c8d92f28b0c1855cd8e.jpg";


    //const [webcamStream, setwebcamStream] = useState()
    //update with logic for webcam
    const webcamStream = "https://media.abc10.com/assets/KXTV/images/fbe592a9-8f75-4c63-8ba9-97d624e3e15b/fbe592a9-8f75-4c63-8ba9-97d624e3e15b_1920x1080.jpg";


    
    
    const toggleMuted =() => {
        setIsMuted(!isMuted);

    }

    
    const toggleVolumeExpanded =() => {
        setIsVolumeExpanded(!isVolumeExpanded);

    }


    const showVolumePanel =() => {
        setHasVolumePanel(true);

    }

    const hideVolumePanel =() => {
        setHasVolumePanel(false);
        setIsVolumeExpanded(false);

    }



    return (
        <>
          
        <div 
            className={`
            ${styles.container} 
            ${isSpeaking && styles.containerSpeaking} 
            `} 
            onMouseLeave={hideVolumePanel}
            onMouseOver={showVolumePanel}
        >
            
            {/* ///////////////////// */}
            {/* Volume Panel*/}
            {/* ///////////////////// */}

            {hasVolumePanel && (
                <div className={`
                    ${styles.volumePanel} 
                    ${isVolumeExpanded && styles.volumePanelActive} 
                `} >
                    
                    <VolumeButton onClick={toggleVolumeExpanded} />
                    {isVolumeExpanded && (
                        <>
                        <input 
                        type="range" 
                        min={0}
                        max={100}
                        defaultValue={50} 

                        className={styles.volumeSlider}
                        />
                        <MuteProfileButton onClick={toggleMuted} buttonState={isMuted}/>
                        </>
                    )}
                </div>
            )}


            {/* ///////////////////// */}
            {/* Muted Overlay*/}
            {/* ///////////////////// */}

            {isMuted && (
                <div className={styles.muteLabel} >
                    <IconMuteIncoming />
                </div>
            )}


            {!hasWebcam
                ?(
                    <>
                    <Avatar
                        aLabel="Profile Image"
                        isPressable={false}
                        picSize={72}
                        imageSrc={profileIcon}
                        />
                    <div className={styles.label}>
                        {profileName}
                    </div>
                    </>

                ):(
                    //video stuff goes here
                    <>
                    <img src={webcamStream} aria-label="Profile Image" className={styles.webcam} />
                    </>
                )
}
        </div>


        </>
    );
};

export default ProfileContainer;
