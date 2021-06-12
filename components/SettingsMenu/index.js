import { useState } from 'react'
import Cookies from 'js-cookie'

import InviteComp from './Invite'
import AccountSettings from './Account'
import Devices from './Devices'

const SettingsMenu = () => {
  const [currentTab, setCurrentTab] = useState('')

  const toggleCurrentPage = (name) => {
    setCurrentTab(name)
  }

  const signOut = () => {
    Cookies.remove('token')
    window.location.pathname = '/'
  }

  const SettingsList = () => {
    return (
      <>
        <h1>H&auml;rth Settings</h1>
        <ul>
          <li>
            <button onClick={() => toggleCurrentPage('invites')}>
              Invites
            </button>
          </li>
          <li>
            <button onClick={() => toggleCurrentPage('account')}>
              Your Account
            </button>
          </li>
          <li>
            <button onClick={() => toggleCurrentPage('devices')}>
              Devices
            </button>
          </li>
          <li>
            <button onClick={() => signOut()}>Sign Out</button>
          </li>
          <li>
            <button onClick={() => window.close()}>Exit</button>
          </li>
        </ul>
      </>
    )
  }
  const DisplayedSettings = () => {
    let comp
    switch (currentTab) {
      case 'invites':
        comp = <InviteComp toggleCurrentPage={toggleCurrentPage} />
        break
      case 'account':
        comp = <AccountSettings toggleCurrentPage={toggleCurrentPage} />
        break
      case 'devices':
        comp = <Devices toggleCurrentPage={toggleCurrentPage} />
        break
      default:
        comp = <SettingsList />
        break
    }
    return comp
  }

  return <DisplayedSettings />
}

export default SettingsMenu
