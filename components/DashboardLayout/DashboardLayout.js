import { useContext, useState } from "react";
import { MobileContext } from "../../contexts/mobile";
import dynamic from "next/dynamic";
import SideNav from "../Menus/SideMenu/SideMenu";
import TopBar from "../Menus/TopBar/TopBar";
import MainNav from "../MainNav/MainNav";
// import MobileSideNav from "../Menus/SideMenu/MobileSideMenu";

import styles from "./DashboardLayout.module.scss";

const DashboardLayout = (props) => {
  const [menuActive, setmenuActive] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isMobile } = useContext(MobileContext);

  const { changePage, children, currentPage, setShowCreateHarthNameModal } =
    props;

  const toggleMenu = () => {
    if (isMobile) {
      setMobileMenuOpen((prevState) => !prevState);
    } else {
      setmenuActive((prevState) => !prevState);
    }
  };

  if (isMobile) {
    const MobileSideNav = dynamic(
      () => import("../Menus/SideMenu/MobileSideMenu"),
      {
        loading: () => null,
      }
    );
    return (
      <main className={styles.Dashboard}>
        {MobileSideNav ? (
          <MobileSideNav
            mobileMenuOpen={mobileMenuOpen}
            onToggleMenu={toggleMenu}
            setShowCreateHarthNameModal={setShowCreateHarthNameModal}
          />
        ) : null}
        <div className={styles.DashboardContent}>
          <TopBar currentPage={currentPage}></TopBar>
          <section
            className={`${styles.DashboardContentWrapper} ${styles.Mobile}`}
            id="content_wrapper"
          >
            {children}
          </section>
          <MainNav
            onToggleMenu={toggleMenu}
            changePage={changePage}
            currentPage={currentPage}
          />
        </div>
      </main>
    );
  }

  return (
    <main className={styles.Dashboard}>
      <SideNav
        menuOpen={menuActive}
        onToggleMenu={toggleMenu}
        setShowCreateHarthNameModal={setShowCreateHarthNameModal}
      />
      <div className={styles.DashboardContent}>
        <TopBar currentPage={currentPage}>
          <MainNav
            onToggleMenu={toggleMenu}
            changePage={changePage}
            currentPage={currentPage}
          />
        </TopBar>
        <section
          className={`${styles.DashboardContentWrapper} ${styles.Desktop}`}
          id="content_wrapper"
        >
          {children}
        </section>
      </div>
    </main>
  );
};

export default DashboardLayout;
