import { useState } from "react";

import UserIcon from "../../../../../components/UserIcon/userIcon";

import styles from "./PeerList.module.scss";

const PeerList = ({ myPeer, peers, toggleAudio, userInfo, groupStreams }) => {
    const [updateCount, setUpdateCount] = useState(0);

    const toggleRemoteMute = (peer, index) => {
        let muted = true;
        if (userInfo[peer.name]) {
            if (!userInfo[peer.name].muted) {
            } else {
                muted = !userInfo[peer.name].muted;
            }
            userInfo[peer.name].muted = muted;
        }

        if (muted) {
            userInfo[peer.name].oldVolume = userInfo[peer.name].volume;
            userInfo[peer.name].volume = 1;
            muteRemotePeer(peer);
        } else {
            userInfo[peer.name].volume = userInfo[peer.name].oldVolume || 100;
            unMuteRemotePeer(peer);
        }
    };

    const muteRemotePeer = (peer) => {
        let stream = groupStreams[peer.peerId];
        stream.getTracks().forEach((track) => {
            if (track.kind === "audio") {
                track.enabled = false;
                setUpdateCount((preCount) => (preCount += 1));
            }
        });
    };
    const unMuteRemotePeer = (peer) => {
        let stream = groupStreams[peer.peerId];
        stream.getTracks().forEach((track) => {
            if (track.kind === "audio") {
                track.enabled = true;
                setUpdateCount((preCount) => (preCount += 1));
            }
        });
    };

    const toggleShowRemoteVolume = (peer) => {
        let showVolume = true;
        if (userInfo[peer.name]) {
            if (!userInfo[peer.name].showVolume) {
            } else {
                showVolume = !userInfo[peer.name].showVolume;
            }
            userInfo[peer.name].showVolume = showVolume;
            setUpdateCount((preCount) => (preCount += 1));
        }
    };

    const volumeSliderHandler = (e, peer) => {
        const { value } = e.target;
        if (userInfo[peer.name]) {
            userInfo[peer.name].volume = value;

            let elem = document.getElementById(peer.peerId);
            if (elem) {
                elem.volume = value / 100;
            }

            setUpdateCount((preCount) => (preCount += 1));
        }
    };

    return (
        <ul className={styles.voiceGatheringPeersList}>
            {myPeer &&
                peers.map((peer, index) => {
                    return (
                        <li
                            key={index}
                            className={`${styles.voiceGatheringPeer} ${
                                userInfo[peer.name]?.showVolume
                                    ? styles.volumeOpen
                                    : ""
                            }`}
                        >
                            <span>
                                <UserIcon
                                    img={peer?.img}
                                    name={peer?.name}
                                    onClick={() => toggleShowRemoteVolume(peer)}
                                />
                                {peer.peerId === myPeer?.id ? (
                                    <button
                                        onClick={toggleAudio}
                                        className={`${
                                            styles.voiceGatheringPeerMute
                                        } ${
                                            userInfo[peer?.name]?.audio
                                                ? ""
                                                : styles.isMuted
                                        }`}
                                    >
                                        {userInfo[peer?.name]?.audio
                                            ? "MUTE"
                                            : "UNMUTE"}
                                    </button>
                                ) : (
                                    <button
                                        className={`${
                                            styles.voiceGatheringPeerToggleVolume
                                        } ${
                                            userInfo[peer?.name]?.muted
                                                ? styles.isMuted
                                                : ""
                                        }`}
                                        onClick={() =>
                                            toggleShowRemoteVolume(peer)
                                        }
                                    >
                                        Volume
                                    </button>
                                )}
                            </span>
                            {userInfo[peer.name] &&
                            userInfo[peer.name].showVolume ? (
                                <div
                                    className={styles.voiceGatheringPeerVolume}
                                >
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        className={styles.volumeSlider}
                                        value={
                                            userInfo[peer.name] &&
                                            userInfo[peer.name].volume
                                                ? parseInt(
                                                      userInfo[peer.name].volume
                                                  )
                                                : 100
                                        }
                                        id={`volume_${peer.peerId}`}
                                        onChange={(e) =>
                                            volumeSliderHandler(e, peer)
                                        }
                                    />
                                    <button
                                        className={`${
                                            styles.voiceGatheringMutePeer
                                        } ${
                                            userInfo[peer?.name]?.muted
                                                ? styles.isMuted
                                                : ""
                                        }`}
                                        onClick={() =>
                                            toggleRemoteMute(peer, index)
                                        }
                                    >
                                        {userInfo[peer.name].muted
                                            ? "MUTE"
                                            : "UNMUTE"}
                                    </button>
                                </div>
                            ) : null}
                        </li>
                    );
                })}
        </ul>
    );
};

export default PeerList;
