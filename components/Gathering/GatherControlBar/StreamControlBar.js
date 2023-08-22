import { useState, useContext, useRef } from "react";
import { MobileContext } from "../../../contexts/mobile";
import { DiceBar } from "../GatherTools/DiceBar";
import { MapBar } from "../GatherTools/MapBar";
import { Modal } from "../../Common";
import { IconCancelCastFill } from "resources/icons/IconCancelCastFill";
import { IconPresentFill } from "resources/icons/IconPresentFill";
import { IconStream } from "resources/icons/IconStream";
import { IconStreamCancel } from "resources/icons/IconStreamCancel";
import OutsideClickHandler from "components/Common/Modals/OutsideClick";
import { IconMicFill } from "resources/icons/IconMicFill";
import { IconMuteMicFill } from "resources/icons/IconMuteMicFill";
import { IconSmsFill } from "resources/icons/IconSmsFill";
import { IconPower } from "resources/icons/IconPower";
import { IconChevronLeft } from "resources/icons/IconChevronLeft";

import styles from "./StreamControlBar.module.scss";


const StreamButton = (props) => {
    const { isMobile = false, onPress, isOn } = props;

    return (
        <button
            className={`
                ${styles.streamButton} 
                ${isMobile ? styles.streamButtonMobile : styles.streamButtonDesktop} 
                ${isOn ? styles.streamButtonActive : styles.streamButtonInactive}
            `}
            aria-label="Stream"
            onClick={onPress}
        >
            {isOn ? (
                <IconStreamCancel hasGradient="true" />
            ) : (
                <IconStream hasGradient={false} />
            )}
        </button>
    );
};

const MicButton = (props) => {
    const {
      isMobile = false,
      onPress,
      audioList,
      changeAudioDevice,
      clearAudioList,
      isOn,
    } = props;
  
    return (
      <div className={styles.BagButton}>
        {audioList ? (
          <OutsideClickHandler
            onClickOutside={clearAudioList}
            onFocusOutside={clearAudioList}
          >
            <div className={styles.OptionsMenu}>
              <div className={styles.OptionsMenuContainer}>
                {audioList.map((device) => {
                  let lastUsedAudioDeviceID = localStorage.getItem(
                    "lastUsedAudioDeviceID"
                  );
                  const { label, deviceId } = device;
                  return (
                    <button
                      id={
                        lastUsedAudioDeviceID == deviceId ? styles.selected : null
                      }
                      key={deviceId}
                      onClick={() => {
                        clearAudioList();
                        changeAudioDevice(device);
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </OutsideClickHandler>
        ) : null}
        <button
          className={`
                  ${styles.micButton} 
                  ${isMobile ? styles.micButtonMobile : styles.micButtonDesktop} 
                  ${isOn ? styles.micButtonInactive : styles.micButtonMuted}
              `}
          aria-label="Microphone"
          onClick={onPress}
        >
          {isOn ? (
            <div height="100%" width="100%">
              <IconMicFill hasGradient={true} />
            </div>
          ) : (
            <div height="100%" width="100%">
              <IconMuteMicFill hasGradient={false} />
            </div>
          )}
        </button>
      </div>
    );
};

const ChatButton = (props) => {
    const { isMobile = false, onPress, unreadMsg } = props;
    const [buttonState, setButtonState] = useState("off");

    const toggleActive = () => {
        if (buttonState == "off") {
            setButtonState("on");
        } else {
            setButtonState("off");
        }
        onPress();
    };

    /* eslint-disable */

    return (
        <>
            <button
                className={`
                ${styles.chatButton} 
                ${isMobile ? styles.chatButtonMobile : styles.chatButtonDesktop} 
                ${
                    buttonState == "on"
                        ? styles.chatButtonActive
                        : styles.chatButtonInactive
                }
            `}
                aria-label="Gathering Chat"
                onClick={toggleActive}
            >
                {unreadMsg ? (
                    <div className={styles.alert}  />

                ) : null}
                
                    <IconSmsFill />
                    
            </button>
        </>
    );
};

const LeaveButton = (props) => {
    const { isMobile = false, onPress } = props;

    return (
        <>
            <button
                className={`
                ${styles.leaveButton} 
                ${isMobile ? styles.leaveButtonMobile : styles.leaveButtonDesktop} 
                ${styles.leaveButtonInactive}
            `}
                aria-label="Leave Gathering"
                onClick={onPress}
            >
                <div height="100%" width="100%" className={styles.defaultIcon}>
                    <IconPower />
                </div>
            </button>
        </>
    );
};

const MoreButton = (props) => {
    const { onPress, isActive } = props;
  
    return (
      <>
        <button
          className={`
                  ${styles.moreButton} 
                  ${isActive ? styles.moreButtonActive : null}
              `}
          aria-label="More"
          onMouseDown={() => {
            if (!isActive) {
              onPress();
            }
          }}
        >
          <div height="100%" width="100%">
            <IconChevronLeft />
          </div>
        </button>
      </>
    );
  };


const StreamControlBar = (props) => {
    const {
        roomType = "party",
        onLeaveHandler,
        onToggleVideo,
        onToggleAudio,
        onToggleScreenShare,
        captureIsActice,
        onToggleChat,
        diceRollHandler,
        changeAudioDevice,
        changeVideoDevice,
        unreadMsg,
        roomId,
        mapChangeHandler,
        mapUpdate,
        hasAudioStream,
        hasVideoStream,
        hasScreenShareStream,
    } = props;
    const [modal, setModal] = useState();
    const [showDiceModal, setShowDiceModal] = useState();
    const [showMapModal, setShowMapModal] = useState();
    const [audioList, setAudioList] = useState();
    const [videoList, setVideoList] = useState();

    const AudioDeviceListCount = useRef(0);
    const VideoDeviceListCount = useRef(0);

    const { isMobile } = useContext(MobileContext);

    const showModal = () => {
        setModal(!modal);
    };

    const togggleDiceModal = () => {
        setShowDiceModal((prevState) => !prevState);
    };
    const togggleMapModal = () => {
        setShowMapModal((prevState) => !prevState);
    };

    const onToggleAudioDevicesModal = () => {
        if (audioList) {
            setAudioList(null);
        } else {
            navigator.mediaDevices
                .enumerateDevices()
                .then((devices) => {
                    let audioInputs = devices.filter(
                        ({ kind }) => kind == "audioinput"
                    );
                    setAudioList(audioInputs);
                })
                .catch((err) => {
                    console.error(err);
                });
        }
    };

    try {
        if (!navigator.mediaDevices?.enumerateDevices) {
            AudioDeviceListCount.current = 0;
            VideoDeviceListCount.current = 0;
        } else {
            navigator.mediaDevices
                .enumerateDevices()
                .then((devices) => {
                    let tempAudioList = [];
                    let tempVideoList = [];
                    devices.forEach((device) => {
                        if (device.kind.includes("audio")) {
                            tempAudioList.push(device);
                        }
                        if (device.kind.includes("video")) {
                            tempVideoList.push(device);
                        }
                    });
                    AudioDeviceListCount.current = tempAudioList.length || 0;
                    VideoDeviceListCount.current = tempVideoList.length || 0;
                })
                .catch(() => {
                    AudioDeviceListCount.current = 0;
                    VideoDeviceListCount.current = 0;
                });
        }
    } catch (error) {
        AudioDeviceListCount.current = 0;
        VideoDeviceListCount.current = 0;
    }

    return (
        <>
            <div className="conditionals">
                {showMapModal ? (
                    <MapBar
                        togggleMapModal={togggleMapModal}
                        roomId={roomId}
                        mapChangeHandler={mapChangeHandler}
                        mapUpdate={mapUpdate}
                    />
                ) : null}
                {showDiceModal ? (
                    <DiceBar
                        diceRollHandler={diceRollHandler}
                        togggleDiceModal={togggleDiceModal}
                    />
                ) : null}
                {modal ? (
                    <Modal show={modal} onToggleModal={showModal}>
                        <div>something</div>
                    </Modal>
                ) : (
                    ""
                )}
            </div>

            {isMobile ? (
                <header className={styles.mobile}>
                    {roomType == "voice" && (
                        <div className={styles.spacerLarge} />
                    )}
                    {roomType == "party" && (
                        <>
                            <BagButton
                                isMobile={true}
                                onDicePress={togggleDiceModal}
                                onMapPress={togggleMapModal}
                            />
                            <CameraButton
                                onPress={onToggleVideo}
                                videoList={videoList}
                                changeVideoDevice={changeVideoDevice}
                                clearVideoList={() => setVideoList(null)}
                                isMobile={true}
                                isOn={hasVideoStream}
                            />
                        </>
                    )}

                    <MicButton
                        onPress={onToggleAudio}
                        audioList={audioList}
                        changeAudioDevice={changeAudioDevice}
                        clearAudioList={() => setAudioList(null)}
                        isOn={hasAudioStream}
                        isMobile={true}
                    />

                    <ChatButton
                        unreadMsg={unreadMsg}
                        onPress={onToggleChat}
                        isMobile={true}
                    />
                </header>
            ) : (
                <header className={styles.desktop}>
                    <div className={styles.controlGroup}>

                        <LeaveButton onPress={onLeaveHandler} />

                        <div className={styles.optionsContainer}>
                            <div className={styles.mainButton}>
                                <MicButton
                                    onPress={onToggleAudio}
                                    audioList={audioList}
                                    changeAudioDevice={changeAudioDevice}
                                    clearAudioList={() => setAudioList(null)}
                                    isOn={hasAudioStream}
                                />
                            </div>
                            {AudioDeviceListCount.current > 1 ? (
                                <div className={styles.position}>
                                    <MoreButton
                                        onPress={onToggleAudioDevicesModal}
                                        isActive={!!audioList}
                                    />
                                </div>
                            ) : null}
                        </div>

                        <StreamButton
                            onPress={onToggleScreenShare}
                            show={captureIsActice}
                            isOn={hasScreenShareStream}
                        />
                    </div>


                    <ChatButton
                        unreadMsg={unreadMsg}
                        onPress={onToggleChat}
                    />

                </header>
            )}
        </>
    );
};

export default StreamControlBar;
