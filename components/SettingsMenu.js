import { useEffect, useState, useRef } from "react";
import { useComms } from "../contexts/comms";
import { generateInvite, getInviteById } from "../requests/community";
import { Button } from "./Common/Button";

import Select from "react-select";

const SettingsMenu = (props) => {
  const [currentTab, setCurrentTab] = useState("");
  const [selectedHarth, setSelectedHarth] = useState("");
  const [invites, setInvites] = useState({});

  const { comms, selectedcomm } = useComms();

  const codeRef = useRef();

  const createInvite = async (e) => {
    e.preventDefault();
    const data = await generateInvite(selectedHarth);
    const { ok, invite } = data;
    if (ok) {
      setInvites({ ...invites, [invite.comm_id]: invite });
    }
  };
  const toggleCurrentPage = (name) => {
    setCurrentTab(name);
  };
  const changeSelectedHarth = async ({ value }) => {
    let invt = await getInviteById(value);
    let { ok, invite } = invt;
    if (invite[0]) {
      setInvites({ ...invites, [invite[0].comm_id]: invite[0] });
    }
    setSelectedHarth(value);
  };
  const copyInviteToClipboard = () => {
    codeRef.current.select();
    document.execCommand("copy");
  };

  // components ------------------------------------

  const InviteComp = () => {
    let selectedInvite;
    let expiredTime;
    let urls = {
      development: "http://localhost:3000/",
      production: "https://project-blarg-next.vercel.app/",
    };
    let inviteUrl;
    for (let [key, value] of Object.entries(invites)) {
      if (key === selectedHarth) {
        expiredTime =
          24 - (new Date(value.expiration).getHours() - new Date().getHours());
        selectedInvite = value;
        inviteUrl = `${urls[process.env.NODE_ENV]}?invite=true&tkn=
        ${selectedInvite.token}`;
      }
    }

    const options = [];

    comms &&
      comms.map((com) => {
        options.push({
          value: com._id,
          label: (
            <span>
              <img src={com.iconKey} /> {com.name}
            </span>
          ),
        });
      });

    return (
      <>
        <div id="harth_invite_header">
          <button id="go_back" onClick={() => toggleCurrentPage("")}>
            back
          </button>
          <span>Invites</span>
        </div>

        <form onSubmit={createInvite} id="harth_invite_form">
          <div className="invite-select-wrapper">
            <Select
              className="harth-invite-select"
              classNamePrefix="harth-invite-select"
              placeholder="Select a H&auml;rth"
              options={options}
              onChange={changeSelectedHarth}
              value={(options || []).filter((option) => {
                if (option.value === selectedHarth) {
                  return {
                    value: option.value,
                    label: option.value,
                  };
                }
              })}
            />
          </div>
          {selectedInvite ? (
            <>
              <div className="invite-code">
                <p>{selectedInvite.token}</p>
                <textarea readOnly value={inviteUrl} ref={codeRef}></textarea>
              </div>
              <p>Invite link will remain active for {expiredTime} hours</p>
              <Button
                text="Copy Invite"
                onClick={copyInviteToClipboard}
                type="button"
              ></Button>
            </>
          ) : (
            <Button type="submit" text="Create Invite" />
          )}
        </form>
      </>
    );
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
        comp = <InviteComp />;
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
