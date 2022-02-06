import { useContext, useState } from 'react'
import Cookies from 'js-cookie'

import InviteComp from './Invite'
import AccountSettings from './Account'
import Devices from './Devices'

import { Context } from '../../pages/_app'

const SettingsMenu = () => {
  const [currentTab, setCurrentTab] = useState('')
  const [value, dispatch] = useContext(Context);

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
        {value.screenSize === "isDesktop" ? <h1>H&auml;rth Settings</h1>: null }
        <ul id="leftMenuSettings">
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
          {value.screenSize === "isDesktop" ?
            <li>
              <button onClick={() => toggleCurrentPage('devices')}>
                Devices
              </button>
            </li>
            : 
            null
          }
          <li>
            <button onClick={() => signOut()}>Sign Out</button>
          </li>
          {value.screenSize === "isDesktop" ?
            <li>
              <button onClick={() => window.close()}>Exit</button>
            </li>
            : 
            null
          }
          
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
