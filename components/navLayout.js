import TopNav from "./TopNav";
import SideNav from "./SideNav";
import { useState } from "react";
import MainMenu from "./MainMenu";

const Layout = (props) => {
  const [menuActive, setmenuActive] = useState(false);

  const { changePage, children, comms } = props;
  console.log(props);

  const toggleMenu = () => {
    setmenuActive(!menuActive);
  };
  return (
    <main className={menuActive ? "menu-open" : ""} id="dashboard">
      <MainMenu comms={comms} />
      <TopNav comms={comms} onToggleMenu={toggleMenu} changePage={changePage} />
      <SideNav comms={comms} />
      <section id="main-content">{children}</section>
    </main>
  );
};

export default Layout;
