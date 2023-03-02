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
    roomId,
    userInfo,
    mapChangeHandler,
    mapUpdate,
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
          let audioInputs = devices.filter(({ kind }) => kind == "audioinput");
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
          let videoInputs = devices.filter(({ kind }) => kind == "videoinput");
          setVideoList(videoInputs);
        })
        .catch((err) => {});
    }
  };

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
          {roomType == "voice" && <div className={styles.spacerLarge} />}
          {roomType == "party" && <BagButton isMobile={true} />}
          {roomType != "voice" && (
            <CameraButton
              onPress={onToggleVideo}
              videoList={videoList}
              changeVideoDevice={changeVideoDevice}
              clearVideoList={() => setVideoList(null)}
              isMobile={true}
            />
          )}
          <MicButton
            onPress={onToggleAudio}
            audioList={audioList}
            changeAudioDevice={changeAudioDevice}
            clearAudioList={() => setAudioList(null)}
            isMobile={true}
          />
          {roomType != "voice" && (
            <StreamButton
              onPress={onToggleScreenShare}
              show={captureIsActice}
              isMobile={true}
            />
          )}
          <ChatButton
            unreadMsg={unreadMsg}
            onPress={onToggleChat}
            isMobile={true}
          />
        </header>
      ) : (
        <header className={styles.desktop}>
          <LeaveButton onPress={onLeaveHandler} />

          {roomType != "voice" ? (
            <div className={styles.middleGroup}>
              {roomType == "party" ? (
                <div className={styles.optionsContainer}>
                  <div className={styles.mainButton}>
                    <CameraButton
                      onPress={onToggleVideo}
                      videoList={videoList}
                      changeVideoDevice={changeVideoDevice}
                      clearVideoList={() => setVideoList(null)}
                      isOn={userInfo?.video}
                    />
                  </div>
                  <div className={styles.moreButton}>
                    <MoreButton
                      onPress={onToggleVideoDevicesModal}
                      isActive={!!videoList}
                    />
                  </div>
                </div>
              ) : null}

              <div className={styles.optionsContainer}>
                <div className={styles.mainButton}>
                  <MicButton
                    onPress={onToggleAudio}
                    audioList={audioList}
                    changeAudioDevice={changeAudioDevice}
                    clearAudioList={() => setAudioList(null)}
                    isOn={userInfo?.audio}
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
                isOn={userInfo?.screenShare}
              />
              {roomType == "party" && (
                <BagButton
                  onDicePress={togggleDiceModal}
                  onMapPress={togggleMapModal}
                />
              )}
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

          {roomType == "voice" ? (
            <p className={styles.spacerSmall}></p>
          ) : (
            <ChatButton unreadMsg={unreadMsg} onPress={onToggleChat} />
          )}
        </header>
      )}
    </>
  );
};

export default GatherControlBar;
