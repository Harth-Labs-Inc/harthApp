import { useEffect, useState } from 'react'

import { Button } from '../Common/Button'
import RadioButton from '../Common/Radio'

const Devices = (props) => {
  const { toggleCurrentPage } = props
  const [devices, setDevices] = useState([])

  useEffect(async () => {
    await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
    let deviceList = await navigator.mediaDevices.enumerateDevices()
    console.log(deviceList)
    setDevices(deviceList)
  }, [])

  return (
    <>
      <div id="account_settings_header">
        <Button id="go_back" onClick={() => toggleCurrentPage('')}>
          back
        </Button>
        <span>Devices</span>
      </div>

      <div id="device_list">
        <ul>
          <li>
            <h4>Input Microphone</h4>
            <ul>
              {devices.map((device, index) => {
                if (
                  device.deviceId !== 'default' &&
                  device.kind === 'audioinput'
                ) {
                  return (
                    <li key={index}>
                      <RadioButton label={device.label}></RadioButton>
                    </li>
                  )
                }
              })}
            </ul>
          </li>
          <li>
            <h4>Output Speakers</h4>
            <ul>
              {devices.map((device, index) => {
                if (
                  device.deviceId !== 'default' &&
                  device.kind === 'audiooutput'
                ) {
                  return (
                    <li key={index}>
                      <RadioButton label={device.label}></RadioButton>
                    </li>
                  )
                }
              })}
            </ul>
          </li>
          <li>
            <h4>Camera</h4>
            <ul>
              {devices.map((device, index) => {
                if (
                  device.deviceId !== 'default' &&
                  device.kind === 'videoinput'
                ) {
                  return (
                    <li key={index}>
                      <RadioButton label={device.label}></RadioButton>
                    </li>
                  )
                }
              })}
            </ul>
          </li>
        </ul>
      </div>
    </>
  )
}

export default Devices
