import { useState, useContext } from "react";
import { MobileContext } from "../../../contexts/mobile";
import { Modal } from "../../Common/Modals/Modal";
import { LeaveButtonMobile } from "../Controls/LeaveButtonMobile";


import { IconPower } from "../../../resources/icons/IconPower";
//import { IconCloseFullScreen } from "../../../resources/icons/IconCloseFullScreen";
import styles from "./gatherHeader.module.scss";

const GatherHeader = (props) => {
    const { gatheringName, selectedHarthIcon, leaveMethod } =
        props;
    const [modal, setModal] = useState();
    const { isMobile } = useContext(MobileContext);

    const showMobileMenu = () => {
        setModal(!modal);
    };

    // const toggleAction = () => {
    //     //nothing here yet
    // };

    return (
        <>
            {modal ? (
                <Modal
                    show={modal}
                    onToggleModal={showMobileMenu}
                    isDark={true}
                >
                    <div className={styles.leaveMenu}>
                        {/* <button
                            className={styles.menuItem}
                            onClick={leaveMethod}
                        >
                            <IconCloseFullScreen />
                            <p>Minimize Gathering</p>
                        </button> */}
                        <button
                            className={styles.menuItem}
                            onClick={leaveMethod}
                        >
                            <IconPower />
                            <p>Leave Gathering</p>
                        </button>
                    </div>
                </Modal>
            ) : (
                ""
            )}

            <div className={isMobile ? styles.mobile : styles.desktop}>
                {isMobile ? <LeaveButtonMobile onClick={showMobileMenu} /> : null}
                
                <div className={styles.labelHolder}>
                    {gatheringName}
                </div>

                {isMobile ? (
                    <div className={styles.mobileSpacer} />
                    ) : (null)
                }  
                
            </div>
        </>
    );
};

export default GatherHeader;
