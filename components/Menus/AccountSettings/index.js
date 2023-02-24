import { useContext, useState } from "react";
import dynamic from "next/dynamic";
// import SettingsList from "./AccountSettings";
// import InviteComp from "./Invite";
// import AccountProfile from "./AccountProfile";
// import Devices from "./Devices";

import { MobileContext } from "../../../contexts/mobile";

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
        const InviteComp = dynamic(() => import("./Invite"), {
          loading: () => null,
        });
        comp = InviteComp ? (
          <InviteComp toggleCurrentPage={toggleCurrentTab} />
        ) : null;
        break;
      case "accountprofile":
        const AccountProfile = dynamic(() => import("./AccountProfile"), {
          loading: () => null,
        });
        comp = AccountProfile ? (
          <AccountProfile toggleCurrentPage={toggleCurrentTab} />
        ) : null;
        break;
      case "devices":
        const Devices = dynamic(() => import("./Devices"), {
          loading: () => null,
        });
        comp = Devices ? (
          <Devices toggleCurrentPage={toggleCurrentTab} />
        ) : null;
        break;
      default:
        const SettingsList = dynamic(() => import("./AccountSettings"), {
          loading: () => null,
        });
        comp = SettingsList ? (
          <SettingsList toggleCurrentTab={toggleCurrentTab} />
        ) : null;
        break;
    }
    return comp;
  };

  return <DisplayedSettings />;
};

export default SettingsMenu;
