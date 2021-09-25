import { useState } from 'react'

import TopNav from './TopNav'
import SideNav from './SideNav'
import Tavern from '../pages/tavern'

const Layout = (props) => {
  const [menuActive, setmenuActive] = useState(false)
  const [showTavern, setShowTavern] = useState(false)

  const { changePage, children, currentPage } = props

  const toggleMenu = () => {
    setmenuActive(!menuActive)
  }
  const toggleTavern = (active) => {
    setShowTavern(active)
  }

  const Dashboard = () => {
    return (
      <div className={menuActive ? 'menu-open' : undefined} id="dashboard">
        <TopNav
          onToggleMenu={toggleMenu}
          changePage={changePage}
          currentPage={currentPage}
        />

        <section id="content_wrapper">{children}</section>
      </div>
    )
  }

  return (
    <main id="main_content">
      <SideNav toggleTavern={toggleTavern} />
      {!showTavern ? <Dashboard></Dashboard> : <Tavern></Tavern>}
    </main>
  )
}

export default Layout
