import { useContext, useState } from 'react'
import { MobileContext } from '../contexts/mobile'

import SideNav from './SideNav'
import MobileHeader from './Mobile/MobileHeader/MobileHeader'
import MainNav from './MainNav/MainNav'


const NavLayout = (props) => {
const [menuActive, setmenuActive] = useState(false)
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
          <MainNav
            onToggleMenu={toggleMenu}
            changePage={changePage}
            currentPage={currentPage}
          />
          <section id="content_wrapper">{children}</section>
        </>
      ) : (
        <>
          <MobileHeader 
            currentPage={currentPage}
            />
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
      <Dashboard></Dashboard>
    </main>
  )
}

export default NavLayout
