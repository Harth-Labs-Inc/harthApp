import TopNav from "./TopNav";
import SideNav from "./SideNav";
import { useState } from "react";
import MainMenu from "./MainMenu";

const Layout = (props) => {
  const [menuActive, setmenuActive] = useState(false);

  const { changePage, children, currentPage } = props;

  const toggleMenu = () => {
    setmenuActive(!menuActive);
  };
  return (
    <main className={menuActive ? "menu-open" : undefined} id="dashboard">
      <MainMenu />
      <TopNav
        onToggleMenu={toggleMenu}
        changePage={changePage}
        currentPage={currentPage}
      />
      <SideNav />
      <section id="main-content">{children}</section>
    </main>
  );
};

export default Layout;
