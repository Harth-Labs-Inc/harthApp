import { useContext, useState } from "react";

import SettingsList from "./AccountSettings";
import InviteComp from "./Invite";
import AccountProfile from "./AccountProfile";
import Devices from "./Devices";

import { MobileContext } from "../../../contexts/mobile";

import CloseButton from "../../Common/Buttons/CloseButton";
import BackButtonMobile from "../../Gathering/Controls/BackButtonMobile";

const SettingsMenu = () => {
    const [currentTab, setCurrentTab] = useState("");
    const { isMobile } = useContext(MobileContext);

    const toggleCurrentTab = (name) => {
        setCurrentTab(name);
    };

    const DisplayedSettings = () => {
        let comp;
        switch (currentTab) {
            case "invites":
                comp = <InviteComp toggleCurrentPage={toggleCurrentTab} />;
                break;
            case "accountprofile":
                comp = <AccountProfile toggleCurrentPage={toggleCurrentTab} />;
                break;
            case "devices":
                comp = <Devices toggleCurrentPage={toggleCurrentTab} />;
                break;
            default:
                comp = <SettingsList toggleCurrentTab={toggleCurrentTab} />;
                break;
        }
        return comp;
    };

    return <DisplayedSettings />;
};

export default SettingsMenu;
