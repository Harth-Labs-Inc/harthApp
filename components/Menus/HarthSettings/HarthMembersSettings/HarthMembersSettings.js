import { useState } from "react";

import { Toggle } from "../../../Common/Toggle/Toggle";
import { useComms } from "../../../../contexts/comms";
import { useAuth } from "../../../../contexts/auth";
import { useSocket } from "../../../../contexts/socket";
import { IconMoreDots } from "../../../../resources/icons/IconMoreDots";
import { Button } from "../../../Common/Buttons/Button";

import { useEffect } from "react";
import { getHarthByID, leaveHarthByID } from "../../../../requests/community";
import styles from "./harthmembersettings.module.scss";
import { set } from "react-hook-form";

const HarthMembersSettings = () => {
  const { selectedcomm, updateSelectedHarth, updateLocalSelectedHarth } =
    useComms();
  const { user } = useAuth();
  const { emitUpdate } = useSocket();
  const [showAdminPanel, setShowAdminPanel] = useState(false);


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

  const toggleAdminPanel = () => {
    setShowAdminPanel(!showAdminPanel);
  }

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
    <div className={styles.listHolder}>

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
            <>
            <div className={`
              ${styles.peopleRow}
              ${showAdminPanel && styles.peopleRowActive}
            `}
            >
            <img src={usr?.iconKey} />

            <div className={styles.userInfo}>
              {usr?.name}
              <p>{membershipStatus}</p>
            </div>


            {hasAdminControls ? (
              <button className={styles.adminButton} onClick={toggleAdminPanel}>
                <IconMoreDots />
              </button>
            ) : null}
          </div>
          
          {showAdminPanel ? (
            <div className={styles.adminPanel}>
              <Button tier="secondary" size="small" onClick={() => kickMemberHandler(usr)} text="Kick User" />

              {isSuperUser ? (
                <div className={styles.makeAdmin}>
                  <Toggle
                    onToggleChange={() => toggleAdminHandler(usr)}
                    toggleName="chat"
                    isChecked={isAdmin}
                  />
                  <p>Make Admin</p>
                </div>
              ) : null}
            </div>
            ) : ( null)
          }


          </>
          );
      })}


      
      {(() => {
            const arr = [];
            for (let i = ((selectedcomm?.users || []).length + 1); i < 16; i++) {
                arr.push(
                    <div className={styles.remainingRow}>
                      <div className={styles.numberHolder}>{i}</div>
                      Open
                    </div>
                );
            }
            return arr;
        })()}

    </div>

    </>
  );
};

export default HarthMembersSettings;
