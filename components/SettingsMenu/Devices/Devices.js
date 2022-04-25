import React, { useEffect, useState, useRef } from 'react'

import { BackButton } from '../../Common'
import RadioButton from '../../Common/Radio'

import sharedStyles from '../SettingsMenu.module.scss'
import styles from './Devices.module.scss'

const Devices = (props) => {
  const { toggleCurrentPage } = props
  const [devices, setDevices] = useState([])

  // const micRefs = useRef(arr.map(() => React.createRef()))
  // const speakerRefs = useRef(arr.map(() => React.createRef()))
  // const cameraRefs = useRef(arr.map(() => React.createRef()))

  useEffect(async () => {
    // await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
    let deviceList = await navigator.mediaDevices.enumerateDevices()
    setDevices(deviceList)
  }, [])

  // useEffect(() => {
  //   micRefs.current[0].current.isSelected
  // }, [devices])

  const selectDevice = () => {}

  return (
    <>
      <div className={sharedStyles.AccountSettingsHeader}>
        <BackButton
          onClick={() => toggleCurrentPage('')}
          buttonClass={styles.AccountSettingsHeaderBack}
        />
        <span>Devices</span>
      </div>

      <div className={styles.DeviceList}>
        <div className={styles.DeviceListGroup}>
          <h4>Input Microphone</h4>
          <ul className={styles.DeviceListGroupList}>
            {devices.map((device, index) => {
              console.log(device, 'device')
              if (
                // device.deviceId !== 'default' &&
                device.kind === 'audioinput'
              ) {
                return (
                  <li key={index} className={styles.DeviceListItem}>
                    <RadioButton
                      name="audio-input"
                      label={device.label}
                      isSelected={device.deviceId === 'default' ? true : false}
                      onChange={selectDevice}
                    ></RadioButton>
                  </li>
                )
              }
            })}
          </ul>
        </div>
        <div className={styles.DeviceListGroup}>
          <h4>Output Speakers</h4>
          <ul className={styles.DeviceListGroupList}>
            {devices.map((device, index) => {
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
            })}
          </ul>
        </div>
        <div className={styles.DeviceListGroup}>
          <h4>Camera</h4>
          <ul className={styles.DeviceListGroupList}>
            {devices.map((device, index) => {
              if (
                // device.deviceId !== 'default' &&
                device.kind === 'videoinput'
              ) {
                return (
                  <li key={index} className={styles.DeviceListItem}>
                    <RadioButton
                      name="video-input"
                      label={device.label}
                      isSelected={device.deviceId === 'default' ? true : false}
                    ></RadioButton>
                  </li>
                )
              }
            })}
          </ul>
        </div>
      </div>
    </>
  )
}

export default Devices
