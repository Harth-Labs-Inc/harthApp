import dynamic from "next/dynamic";

const SettingsMenu = ({
  toggleCurrentTab,
  currentTab,
  toggleCurrentTabClosed,
}) => {
  const DisplayedSettings = () => {
    let comp;
    /* eslint-disable */
    switch (currentTab) {
      case "accountprofile":
        const AccountProfile = dynamic(() => import("./AccountProfile"), {
          loading: () => null,
        });
        comp = AccountProfile ? (
          <AccountProfile
            toggleCurrentPage={toggleCurrentTabClosed || toggleCurrentTab}
          />
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
