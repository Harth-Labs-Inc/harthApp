import React, { useEffect, useState, useRef } from "react";
import BackButton from "../../Common/Buttons/BackButton";
import RadioButton from "../../Common/Buttons/RadioButton";

import styles from "./SettingsMenu.module.scss";
//import styles from './Devices.module.scss'

const Devices = (props) => {
    const { toggleCurrentPage } = props;
    const [devices, setDevices] = useState([]);

    // const micRefs = useRef(arr.map(() => React.createRef()))
    // const speakerRefs = useRef(arr.map(() => React.createRef()))
    // const cameraRefs = useRef(arr.map(() => React.createRef()))

    // useEffect(async () => {
    //   // await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
    //   let deviceList = await navigator.mediaDevices.enumerateDevices()
    //   setDevices(deviceList)
    // }, [])

    // useEffect(() => {
    //   micRefs.current[0].current.isSelected
    // }, [devices])

    const selectDevice = () => {};

    return (
        <>
            <div className={styles.menuContainer}>
                <div className={styles.settingsHeader}>
                    <BackButton />
                    Devices
                    <div className={styles.spacer} />
                </div>
                <div className={styles.sectionLabel}>Input Microphone</div>
                <div className={styles.sectionContainer}>
                    <RadioButton
                        name="audio-input"
                        label="Input 1"
                        isSelected={false}
                        onChange={selectDevice}
                    />
                    <RadioButton
                        name="audio-input"
                        label="Input 2"
                        isSelected={true}
                        onChange={selectDevice}
                    />
                </div>
                {/* This is the original logic for parsing device list. kept it in for reference */}
                {/* {devices.map((device, index) => {
              if (
                // device.deviceId !== 'default' &&
                device.kind === 'audiooutput'
              ) {
                return (
                  <li key={index} className={styles.DeviceListItem}>
                    <RadioButton
                      name="audio-output"
                      label={device.label}
                      isSelected={device.deviceId === 'default' ? true : false}
                    ></RadioButton>
                  </li>
                )
              }
            })} */}

                <div className={styles.sectionLabel}>Input Mode</div>
                <div className={styles.sectionContainer}>stuff</div>
                <div className={styles.sectionLabel}>Output Speakers</div>
                <div className={styles.sectionContainer}>
                    <RadioButton
                        name="audio-output"
                        label="Output 1"
                        isSelected={true}
                        onChange={selectDevice}
                    />

                    <RadioButton
                        name="audio-output"
                        label="Output 2"
                        isSelected={true}
                        onChange={selectDevice}
                    />
                </div>

                <div className={styles.sectionLabel}>Webcam </div>
                <div className={styles.sectionContainer}>
                    <RadioButton
                        name="webcam"
                        label="Webcam 1"
                        isSelected={true}
                        onChange={selectDevice}
                    />
                    <RadioButton
                        name="webcam"
                        label="Webcam 2"
                        isSelected={true}
                        onChange={selectDevice}
                    />
                </div>
            </div>
        </>
    );
};

export default Devices;
