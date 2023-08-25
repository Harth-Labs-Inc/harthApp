import { useState, useContext, useRef } from "react";
import { MobileContext } from "../../../contexts/mobile";
import { MicButtonStream } from "../Controls/MicButtonStream";
import { MoreButtonStream } from "../Controls/MoreButtonStream";
import { StreamButtonStream } from "../Controls/StreamButtonStream";
import { ChatButtonStream } from "../Controls/ChatButtonStream";
import { LeaveButtonStream } from "../Controls/LeaveButtonStream";
import { DiceBar } from "../GatherTools/DiceBar";
import { MapBar } from "../GatherTools/MapBar";
import { Modal } from "../../Common";
//import { IconPower } from "resources/icons/IconPower";

import styles from "./streamControlBar.module.scss";

const StreamControlBar = (props) => {
    const {
        onLeaveHandler,
        //onToggleVideo,
        onToggleAudio,
        onToggleScreenShare,
        captureIsActice,
        onToggleChat,
        diceRollHandler,
        changeAudioDevice,
        //changeVideoDevice,
        unreadMsg,
        roomId,
        mapChangeHandler,
        mapUpdate,
        hasAudioStream,
        //hasVideoStream,
        hasScreenShareStream,
    } = props;
    const [modal, setModal] = useState();
    const [showDiceModal, setShowDiceModal] = useState();
    const [showMapModal, setShowMapModal] = useState();
    const [audioList, setAudioList] = useState();
    //const [videoList, setVideoList] = useState();

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

    // const onToggleVideoDevicesModal = () => {
    //     if (videoList) {
    //         setVideoList(null);
    //     } else {
    //         navigator?.mediaDevices
    //             .enumerateDevices()
    //             .then((devices) => {
    //                 let videoInputs = devices.filter(
    //                     ({ kind }) => kind == "videoinput"
    //                 );
    //                 setVideoList(videoInputs);
    //             })
    //             .catch((err) => {
    //                 console.error(err);
    //             });
    //     }
    // };

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

                    <MicButtonStream
                        onPress={onToggleAudio}
                        audioList={audioList}
                        changeAudioDevice={changeAudioDevice}
                        clearAudioList={() => setAudioList(null)}
                        isOn={hasAudioStream}
                        isMobile={true}
                    />

                    <ChatButtonStream
                        unreadMsg={unreadMsg}
                        onPress={onToggleChat}
                        isMobile={true}
                    />
                </header>
            ) : (
                <header className={styles.desktop}>
                    <div className={styles.leftGroup}>
                    <LeaveButtonStream onPress={onLeaveHandler} />
                        <div className={styles.optionsContainer}>
                            <div className={styles.mainButton}>
                                <MicButtonStream
                                    onPress={onToggleAudio}
                                    audioList={audioList}
                                    changeAudioDevice={changeAudioDevice}
                                    clearAudioList={() => setAudioList(null)}
                                    isOn={hasAudioStream}
                                />
                            </div>
                            {AudioDeviceListCount.current > 1 ? (
                                    <MoreButtonStream
                                        onPress={onToggleAudioDevicesModal}
                                        isActive={!!audioList}
                                    />

                            ) : null}
                        </div>
                            <StreamButtonStream
                                onPress={onToggleScreenShare}
                                show={captureIsActice}
                                isOn={hasScreenShareStream}
                            />

                    </div>


                        <ChatButtonStream
                            unreadMsg={unreadMsg}
                            onPress={onToggleChat}
                        />
                </header>
            )}


        </>
    );
};

export default StreamControlBar;
