import { useContext, useState } from 'react'

import { Context } from '../pages/_app'

import MainNav from './MainNav/TopNav'
import SideNav from './SideNav'
import Tavern from '../pages/tavern'

const NavLayout = (props) => {
  const [menuActive, setmenuActive] = useState(false)
  const [showTavern, setShowTavern] = useState(false)
  const [value, dispatch] = useContext(Context);

  const { changePage, children, currentPage } = props

  const toggleMenu = () => {
    setmenuActive(prevState => !prevState)

    if(value.screenSize === "isMobile") {

    }
  }

  const toggleTavern = (active) => {
    setShowTavern(active)
  }    

  const Dashboard = () => {
    return (
      <div 
        id="dashboard"
        className = {`
          ${menuActive ? 'menu-open' : undefined}
          ${value.screenSize}
        `} >
        {value.screenSize === "isDesktop" ?
          <>
            <MainNav
              onToggleMenu={toggleMenu}
              changePage={changePage}
              currentPage={currentPage}
            />
            <section id="content_wrapper">{children}</section>
          </> 
          :
          <>
            <section id="content_wrapper">{children}</section>
            <MainNav
              onToggleMenu={toggleMenu}
              changePage={changePage}
              currentPage={currentPage}
            />
          </>
        }
        
      </div>
    )
  }

  return (
      <main id="main_content">
        <SideNav toggleTavern={toggleTavern} menuOpen={menuActive} onToggleMenu={toggleMenu} />
        {!showTavern ? <Dashboard></Dashboard> : <Tavern></Tavern>}
      </main>
  )
}

export default NavLayout
