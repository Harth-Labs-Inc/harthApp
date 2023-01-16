import { useState, useEffect, useContext } from "react";
import { MobileContext } from "../../../contexts/mobile";
import {
    BagButton,
    CameraButton,
    ChatButton,
    LeaveButton,
    MicButton,
    MoreButton,
    StreamButton,
} from "../Controls";
import { DiceBar } from "../GatherTools/DiceBar";
import { MapBar } from "../GatherTools/MapBar";
import { Modal } from "../../Common";

import styles from "./gatheringControlBar.module.scss";

const GatherControlBar = (props) => {
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
    } = props;
    const [modal, setModal] = useState();
    const [showDiceModal, setShowDiceModal] = useState();
    const [showMapModal, setShowMapModal] = useState();
    const [audioList, setAudioList] = useState();
    const [videoList, setVideoList] = useState();

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
        if (!!audioList) {
            setAudioList(null);
        } else if (!navigator.mediaDevices?.enumerateDevices) {
        } else {
            navigator.mediaDevices
                .enumerateDevices()
                .then((devices) => {
                    let audioInputs = devices.filter(
                        ({ kind }) => kind == "audioinput"
                    );
                    setAudioList(audioInputs);
                })
                .catch((err) => {});
        }
    };

    const onToggleVideoDevicesModal = () => {
        if (!!videoList) {
            setVideoList(null);
        } else if (!navigator.mediaDevices?.enumerateDevices) {
        } else {
            navigator.mediaDevices
                .enumerateDevices()
                .then((devices) => {
                    console.log(devices);
                    let videoInputs = devices.filter(
                        ({ kind }) => kind == "videoinput"
                    );
                    setVideoList(videoInputs);
                })
                .catch((err) => {});
        }
    };

    return (
        <>
            <div className="conditionals">
                {showMapModal ? (
                    <MapBar togggleMapModal={togggleMapModal} />
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
                        <div className={styles.leftSpace} />
                    )}
                    {roomType == "party" && <BagButton />}
                    {roomType != "voice" && <CameraButton />}
                    <MicButton />
                    {roomType != "voice" && <StreamButton />}
                    <ChatButton />
                </header>
            ) : (
                <header className={styles.desktop}>
                    <div className={styles.leftGroup}>
                        <LeaveButton onPress={onLeaveHandler} />
                        {roomType == "party" && (
                            <p className={styles.spacer}></p>
                        )}
                    </div>

                    {roomType != "voice" ? (
                        <div className={styles.middleGroup}>
                            <div className={styles.optionsContainer}>
                                <div className={styles.mainButton}>
                                    <CameraButton
                                        onPress={onToggleVideo}
                                        videoList={videoList}
                                        changeVideoDevice={changeVideoDevice}
                                        clearVideoList={() =>
                                            setVideoList(null)
                                        }
                                    />
                                </div>
                                <div className={styles.moreButton}>
                                    <MoreButton
                                        onPress={onToggleVideoDevicesModal}
                                        isActive={!!videoList}
                                    />
                                </div>
                            </div>
                            <div className={styles.optionsContainer}>
                                <div className={styles.mainButton}>
                                    <MicButton
                                        onPress={onToggleAudio}
                                        audioList={audioList}
                                        changeAudioDevice={changeAudioDevice}
                                        clearAudioList={() =>
                                            setAudioList(null)
                                        }
                                    />
                                </div>
                                <div className={styles.moreButton}>
                                    <MoreButton
                                        onPress={onToggleAudioDevicesModal}
                                        isActive={!!audioList}
                                    />
                                </div>
                            </div>
                            <StreamButton
                                onPress={onToggleScreenShare}
                                show={captureIsActice}
                            />
                        </div>
                    ) : (
                        <div className={styles.optionsContainer}>
                            <div className={styles.mainButton}>
                                <MicButton />
                            </div>
                            <div className={styles.moreButton}>
                                <MoreButton />
                            </div>
                        </div>
                    )}

                    <div className={styles.rightGroup}>
                        {roomType == "voice" && (
                            <p className={styles.spacer}></p>
                        )}

                        {roomType == "party" && (
                            <BagButton
                                size="small"
                                onDicePress={togggleDiceModal}
                                onMapPress={togggleMapModal}
                            />
                        )}

                        {roomType != "voice" && (
                            <ChatButton
                                unreadMsg={unreadMsg}
                                size="small"
                                onPress={onToggleChat}
                            />
                        )}
                    </div>
                </header>
            )}
        </>
    );
};

export default GatherControlBar;
