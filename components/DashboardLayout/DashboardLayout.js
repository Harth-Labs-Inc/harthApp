import { useContext, useState } from "react";
import { MobileContext } from "../../contexts/mobile";
import { useComms } from "../../contexts/comms";
import SideNav from "../Menus/SideMenu/SideMenu";
import TopBar from "../Menus/TopBar/TopBar";
import MainNav from "../MainNav/MainNav";

import { Modal } from "../Common";

import styles from "./DashboardLayout.module.scss";
import MobileSideNav from "../Menus/SideMenu/MobileSideMenu";

const DashboardLayout = (props) => {
    const [menuActive, setmenuActive] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { isMobile } = useContext(MobileContext);

    const { changePage, children, currentPage, setShowCreateHarthNameModal } =
        props;

    const { profile } = useComms();

    const toggleMenu = () => {
        if (isMobile) {
            setMobileMenuOpen((prevState) => !prevState);
        } else {
            setmenuActive((prevState) => !prevState);
        }
    };

    // if (!profile) {
    //     return <p>...loading</p>;
    // }

    return (
        <main className={styles.Dashboard}>
            {!isMobile ? (
                <SideNav
                    menuOpen={menuActive}
                    onToggleMenu={toggleMenu}
                    setShowCreateHarthNameModal={setShowCreateHarthNameModal}
                />
            ) : (
                <MobileSideNav
                    mobileMenuOpen={mobileMenuOpen}
                    onToggleMenu={toggleMenu}
                    setShowCreateHarthNameModal={setShowCreateHarthNameModal}
                />
            )}
            <div className={styles.DashboardContent}>
                <TopBar currentPage={currentPage}>
                    {!isMobile ? (
                        <MainNav
                            onToggleMenu={toggleMenu}
                            changePage={changePage}
                            currentPage={currentPage}
                        />
                    ) : null}
                </TopBar>
                <section
                    className={`${styles.DashboardContentWrapper} ${
                        isMobile ? styles.Mobile : styles.Desktop
                    }`}
                    id="content_wrapper"
                >
                    {children}
                </section>
                {isMobile ? (
                    <MainNav
                        onToggleMenu={toggleMenu}
                        changePage={changePage}
                        currentPage={currentPage}
                    />
                ) : null}
            </div>
        </main>
    );
};

export default DashboardLayout;

// import { useContext, useState } from "react";
// import { MobileContext } from "../../contexts/mobile";

// import SideNav from "../SideNav";
// import TopBar from "../Mobile/TopBar/TopBar";
// import MainNav from "../MainNav/MainNav";

// import styles from "./DashboardLayout.module.scss";

// const DashboardLayout = (props) => {
//     const [menuActive, setmenuActive] = useState(false);
//     const { isMobile } = useContext(MobileContext);

//     const { changePage, children, currentPage, setShowCreateHarthNameModal } =
//         props;

//     const toggleMenu = () => {
//         setmenuActive((prevState) => !prevState);

//         if (isMobile) {
//         }
//     };

//     const toggleTavern = (active) => {
//         setShowTavern(active);
//     };

//     const Dashboard = () => {
//         return (
//             <div
//                 id="dashboard"
//                 className={`
//         ${menuActive ? "menu-open" : undefined}
//         ${isMobile ? "isMobile" : "isDesktop"}
//       `}
//             >
//                 {!isMobile ? (
//                     <>
//                         <MainNav
//                             onToggleMenu={toggleMenu}
//                             changePage={changePage}
//                             currentPage={currentPage}
//                         />
//                         <section id="content_wrapper">{children}</section>
//                     </>
//                 ) : (
//                     <>
//                         <TopBar currentPage={currentPage} />
//                         <section id="content_wrapper">{children}</section>
//                         <MainNav
//                             onToggleMenu={toggleMenu}
//                             changePage={changePage}
//                             currentPage={currentPage}
//                         />
//                     </>
//                 )}
//             </div>
//         );
//     };

//     return (
//         <main className={styles.Dashboard}>
//             <SideNav
//                 toggleTavern={toggleTavern}
//                 menuOpen={menuActive}
//                 onToggleMenu={toggleMenu}
//                 setShowCreateHarthNameModal={setShowCreateHarthNameModal}
//             />
//             <div className={styles.DashboardContent}>
//                 <TopBar currentPage={currentPage}>
//                     {!isMobile ? (
//                         <MainNav
//                             onToggleMenu={toggleMenu}
//                             changePage={changePage}
//                             currentPage={currentPage}
//                         />
//                     ) : null}
//                 </TopBar>
//                 <section
//                     className={`${styles.DashboardContentWrapper} ${
//                         isMobile ? styles.Mobile : styles.Desktop
//                     }`}
//                     id="content_wrapper"
//                 >
//                     {children}
//                 </section>
//                 {isMobile ? (
//                     <MainNav
//                         onToggleMenu={toggleMenu}
//                         changePage={changePage}
//                         currentPage={currentPage}
//                     />
//                 ) : null}
//             </div>
//             {/* <Dashboard></Dashboard> */}
//         </main>
//     );
// };

// export default DashboardLayout;
