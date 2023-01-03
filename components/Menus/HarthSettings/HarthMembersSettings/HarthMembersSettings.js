import { Toggle } from "../../../Common/Toggle/Toggle";
import { useComms } from "../../../../contexts/comms";
import { useAuth } from "../../../../contexts/auth";
import { useSocket } from "../../../../contexts/socket";

import { useEffect } from "react";
import { getHarthByID, leaveHarthByID } from "../../../../requests/community";

const HarthMembersSettings = () => {
  const { selectedcomm, updateSelectedHarth, updateLocalSelectedHarth } =
    useComms();
  const { user } = useAuth();
  const { emitUpdate } = useSocket();

  const toggleAdminHandler = async (usr) => {
    let newHarth = {
      ...selectedcomm,
      users: [
        ...(selectedcomm.users || []).map((u) => {
          if (u.userId == usr.userId) {
            return {
              ...u,
              admin: !u.admin,
            };
          } else {
            return u;
          }
        }),
      ],
    };
    await updateSelectedHarth({
      newHarth,
    });
    let msg = {};
    msg.updateType = "selected harth reload";
    msg.comm = newHarth;

    emitUpdate(selectedcomm._id, msg, async (err, status) => {
      if (err) {
        console.log(err);
      }
    });
  };

  const kickMemberHandler = async (usr) => {
    await leaveHarthByID({ harth: selectedcomm, user: usr });
    let msg = {};
    msg.updateType = "selected user reload";
    msg.comm = { ...selectedcomm, selectedUserID: usr.userId };
    emitUpdate(selectedcomm._id, msg, async (err, status) => {
      if (err) {
        console.log(err);
      }
    });
    let result = await getHarthByID(selectedcomm._id);
    const { ok, data } = result;
    if (ok) {
      await updateLocalSelectedHarth({ newHarth: data });
    }
  };

  let isSuperUser = false;
  let isAdminUser = false;

  if (selectedcomm && user) {
    let userIndex = selectedcomm.users.findIndex((usr) => {
      return usr.userId == user._id;
    });

    if (userIndex >= 0) {
      let profile = selectedcomm.users[userIndex];
      isSuperUser = profile?.owner;
      isAdminUser = profile?.admin;
    }
  }

  return (
    <>
      {selectedcomm?.users.map((usr) => {
        let isOwner = false;
        let isAdmin = false;
        let hasAdminControls = false;
        let membershipStatus = "";

        if (usr.admin) {
          isAdmin = true;
          membershipStatus = "ADMIN";
        }
        if (usr.owner) {
          isOwner = true;
          membershipStatus = "OWNER";
        }

        if (isSuperUser || isAdminUser) {
          if (usr.userId !== user._id && isOwner) {
            hasAdminControls = false;
          } else {
            hasAdminControls = true;
          }
        }

        return (
          <div>
            <div>
              <img
                style={{ height: "30px", width: "30px" }}
                src={usr?.iconKey}
              />
              <p>{usr?.name}</p>
              <p>{membershipStatus}</p>
            </div>
            {hasAdminControls ? (
              <>
                <div>
                  <button onClick={() => kickMemberHandler(usr)}>kick</button>
                </div>
                <div>
                  {isSuperUser ? (
                    <>
                      <p>Make Admin</p>
                      <div style={{ width: "max-content" }}>
                        <Toggle
                          onToggleChange={() => toggleAdminHandler(usr)}
                          toggleName="chat"
                          isChecked={isAdmin}
                        ></Toggle>
                      </div>
                    </>
                  ) : null}
                </div>
              </>
            ) : null}
          </div>
        );
      })}
      <p>
        <span>{15 - (selectedcomm?.users || []).length}</span>
        <span>open</span>
      </p>
    </>
  );
};

export default HarthMembersSettings;
