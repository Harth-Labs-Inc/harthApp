import TopNav from "./TopNav";
import SideNav from "./SideNav";
import { useState } from "react";
import MainMenu from "./MainMenu";

const Layout = ({ title, children }) => {
  const [menuActive, setmenuActive] = useState(false);

  const toggleMenu = () => {
    setmenuActive(!menuActive);
  };
  return (
    <main className={menuActive ? "menu-open" : ""} id="dashboard">
      <MainMenu />
      <TopNav onToggleMenu={toggleMenu} />
      <SideNav />
      <section id="main-content">{children}</section>
    </main>
  );
};

export default Layout;
