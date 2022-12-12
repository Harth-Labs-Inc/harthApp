import { useContext, useState } from 'react';
import Cookies from 'js-cookie';
import InviteComp from './Invite';
import AccountSettings from './Account';
import Devices from './Devices';
import { HarthLogoDark } from '../../public/images/harth-logo-dark';
import { IconChevronRight } from '../../resources/icons/IconChevronRight';

import { MobileContext } from '../../contexts/mobile';
import styles from './SettingsMenu.module.scss';

import BackButton from '../Common/Buttons/BackButton';
import CloseButton from '../Common/Buttons/CloseButton';
import BackButtonMobile from '../Gathering/Controls/BackButtonMobile';

const SettingsMenu = () => {
  const [currentTab, setCurrentTab] = useState('')
  const { isMobile } = useContext(MobileContext)

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
      <div className={styles.menuContainer}>
        <div className={styles.headerImage}>
          <HarthLogoDark />
        </div>

        <button className={styles.menuItem} onClick={() => toggleCurrentPage('invites')}>
          Invites
          <div className={styles.iconHolder} ><IconChevronRight /></div>
        </button>

        <button className={styles.menuItem} onClick={() => toggleCurrentPage('account')}>
          Account
          <div className={styles.iconHolder} ><IconChevronRight /></div>
        </button>

        <button className={styles.menuItem} onClick={() => toggleCurrentPage('devices')}>
          Camera & Sound
          <div className={styles.iconHolder} ><IconChevronRight /></div>
        </button>

        <button className={styles.menuItem} onClick={() => signOut()}>
          Sign Out
        </button>

        <button className={styles.menuItem} onClick={() => window.close()}>
          Exit
        </button>
        
        </div>
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
