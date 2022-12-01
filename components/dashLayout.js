import { useContext, useState } from 'react'

import { MobileContext } from '../contexts/mobile'

import MainNav from './MainNav/MainNav'
import DesktopNav from './Desktop/DesktopNav/DesktopNav'
import SideNav from './SideNav'
import Tavern from '../pages/tavern'

const NavLayout = (props) => {
  const [menuActive, setmenuActive] = useState(false)
  const [showTavern, setShowTavern] = useState(false)
  const { isMobile } = useContext(MobileContext)

  const { changePage, children, currentPage } = props

  const toggleMenu = () => {
    setmenuActive((prevState) => !prevState)

    if (isMobile) {
    }
  }

  const toggleTavern = (active) => {
    setShowTavern(active)
  }

  const Dashboard = () => {
    return (
      <div
        id="dashboard"
        className={`
          ${menuActive ? 'menu-open' : undefined}
          ${isMobile ? 'isMobile' : 'isDesktop'}
        `}
      >
        {!isMobile ? (
          <>
            <DesktopNav
              onToggleMenu={toggleMenu}
              changePage={changePage}
              currentPage={currentPage}
            />
            <section id="content_wrapper">{children}</section>
          </>
        ) : (
          <>
            <section id="content_wrapper">{children}</section>
            <MainNav
              onToggleMenu={toggleMenu}
              changePage={changePage}
              currentPage={currentPage}
            />
          </>
        )}
      </div>
    )
  }

  return (
    <main id="main_content">
      <SideNav
        toggleTavern={toggleTavern}
        menuOpen={menuActive}
        onToggleMenu={toggleMenu}
      />
      {!showTavern ? <Dashboard></Dashboard> : <Tavern></Tavern>}
    </main>
  )
}

export default NavLayout
