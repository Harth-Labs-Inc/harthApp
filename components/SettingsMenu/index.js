import { useState } from "react";

import InviteComp from "./Invite";
import AccountSettings from "./Account";

const SettingsMenu = (props) => {
  const [currentTab, setCurrentTab] = useState("");

  const toggleCurrentPage = (name) => {
    setCurrentTab(name);
  };

  const SettingsList = () => {
    return (
      <>
        <h1>H&auml;rth Settings</h1>
        <ul>
          <li>
            <button onClick={() => toggleCurrentPage("invites")}>
              Invites
            </button>
          </li>
          <li>
            <button onClick={() => toggleCurrentPage("account")}>
              Your Account
            </button>
          </li>
          <li>
            <button onClick={() => toggleCurrentPage("devices")}>
              Devices
            </button>
          </li>
          <li>
            <button>Sign Out</button>
          </li>
          <li>
            <button>Exit</button>
          </li>
        </ul>
      </>
    );
  };
  const DisplayedSettings = () => {
    let comp;
    switch (currentTab) {
      case "invites":
        comp = <InviteComp toggleCurrentPage={toggleCurrentPage} />;
        break;
      case "account":
        comp = <AccountSettings toggleCurrentPage={toggleCurrentPage} />;
        break;
      default:
        comp = <SettingsList />;
        break;
    }
    return comp;
  };

  return <DisplayedSettings />;
};

export default SettingsMenu;
