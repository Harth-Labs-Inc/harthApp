import { useState, useContext, useMemo } from "react";
import { MobileContext } from "contexts/mobile";
import { Toggle } from "../../../Common/Toggle/Toggle";
import { useComms } from "../../../../contexts/comms";
import { useAuth } from "../../../../contexts/auth";
import { useSocket } from "../../../../contexts/socket";
import { IconMoreDots } from "../../../../resources/icons/IconMoreDots";
import { Button, Modal } from "Common";
import { getHarthByID, leaveHarthByID } from "../../../../requests/community";
import KickUserModal from "../KickUserModal/KickUserModal";
import BlockUserModal from "../BlockUserModal/BlockUserModal";
import UnBlockUserModal from "../UnBlockUserModal/UnBlockUserModal";

import styles from "./harthmembersettings.module.scss";

const HarthMembersSettings = () => {
  const { selectedcomm, updateSelectedHarth, updateLocalSelectedHarth } =
    useComms();
  const { user } = useAuth();
  const { emitUpdate } = useSocket();
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [modal, setModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState();
  const [blockModal, setBlockModal] = useState(false);
  const [selectedBlockUser, setSelectedBlockUser] = useState();
  const [unBlockModal, setUnBlockModal] = useState(false);
  const [selectedUnBlockUser, setSelectedUnBlockUser] = useState();

  const { isMobile } = useContext(MobileContext);

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

    emitUpdate(selectedcomm._id, msg, async (err) => {
      if (err) {
        console.error(err);
      }
    });
  };

  const kickMemberHandler = async (usr) => {
    await leaveHarthByID({ harth: selectedcomm, user: usr });
    let msg = {};
    msg.updateType = "selected user reload";
    msg.comm = { ...selectedcomm, selectedUserID: usr.userId };
    emitUpdate(selectedcomm._id, msg, async (err) => {
      if (err) {
        console.error(err);
      }
    });
    let result = await getHarthByID(selectedcomm._id);
    const { ok, data } = result;
    if (ok) {
      await updateLocalSelectedHarth({ newHarth: data });
    }
  };

  const toggleAdminPanel = (usr) => {
    let members = [...selectedMembers];
    let index = members.findIndex((memberId) => memberId == usr.userId);
    if (index >= 0) {
      members.splice(index, 1);
    } else {
      members.push(usr.userId);
    }
    setSelectedMembers(members);

    if (members.length) {
      setShowAdminPanel(true);
    } else {
      setShowAdminPanel(false);
    }
  };

  const handleKickMenu = (usr) => {
    setModal((prevState) => !prevState);
    setSelectedUser(usr);
  };
  const handleBlockMenu = (usr) => {
    setBlockModal((prevState) => !prevState);
    setSelectedBlockUser(usr);
  };
  const handleUnBlockMenu = (usr) => {
    setUnBlockModal((prevState) => !prevState);
    setSelectedUnBlockUser(usr);
  };
  const generateRemainingRows = useMemo(() => {
    const arr = [];
    for (let i = (selectedcomm?.users || []).length + 1; i < 16; i++) {
      arr.push(
        <div className={styles.remainingRow} key={`remaining-row-${i}`}>
          <div className={styles.numberHolder}>{i}</div>
          Open
        </div>
      );
    }
    return arr;
  }, [selectedcomm?.users]);

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

  /* eslint-disable */

  return (
    <>
      {modal ? (
        <Modal onToggleModal={setModal} classNames={styles.KickModal}>
          <KickUserModal
            submitKickHandler={kickMemberHandler}
            setHidden={setModal}
            usr={selectedUser}
          />
        </Modal>
      ) : (
        ""
      )}

      {blockModal ? (
        <Modal onToggleModal={setBlockModal} classNames={styles.KickModal}>
          <BlockUserModal
            setHidden={setBlockModal}
            usr={selectedBlockUser}
            activeUser={user}
          />
        </Modal>
      ) : (
        ""
      )}

      {unBlockModal ? (
        <Modal onToggleModal={setUnBlockModal} classNames={styles.KickModal}>
          <UnBlockUserModal
            setHidden={setUnBlockModal}
            usr={selectedUnBlockUser}
            activeUser={user}
          />
        </Modal>
      ) : (
        ""
      )}

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

          if (isAdminUser && !isAdmin) {
            hasAdminControls = true;
          }

          if (isSuperUser) {
            hasAdminControls = true;
          }
          return (
            <div key={usr.userId}>
              <div
                className={`
              ${styles.peopleRow}
              ${
                showAdminPanel &&
                selectedMembers?.includes(usr.userId) &&
                styles.peopleRowActive
              }
            `}
              >
                <img src={usr?.iconKey} loading="lazy" />

                <div className={styles.userInfo}>
                  {usr?.name}
                  <p>{membershipStatus}</p>
                </div>

                {usr.userId != user._id ? (
                  <button
                    className={` 
                                            ${styles.adminButton}
                                            ${
                                              isMobile
                                                ? styles.adminButtonMobile
                                                : styles.adminButtonDesktop
                                            }
                                        `}
                    onClick={() => toggleAdminPanel(usr)}
                  >
                    <IconMoreDots />
                  </button>
                ) : null}
              </div>

              {showAdminPanel && selectedMembers?.includes(usr.userId) ? (
                <div className={styles.adminPanel}>
                    {hasAdminControls ? (
                      <Button
                        tier="secondary"
                        size="small"
                        onClick={() => handleKickMenu(usr)}
                        text="Kick User"
                        isDisabled={usr.userId == user._id}
                      />
                    ) : null}
                      {user.BlockedList?.find(
                        ({ userId }) => userId == usr.userId
                      ) ? (
                        <Button
                          tier="secondary"
                          size="small"
                          onClick={() => handleUnBlockMenu(usr)}
                          text="UnBlock User"
                          isDisabled={usr.userId == user._id}
                          forcedColor="#9b0022"
                        />
                      ) : (
                        <Button
                          tier="secondary"
                          size="small"
                          onClick={() => handleBlockMenu(usr)}
                          text="Block User"
                          isDisabled={usr.userId == user._id}
                        />
                      )}


                  {hasAdminControls ? (
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
              ) : null}
            </div>
          );
        })}

        {generateRemainingRows}
      </div>
    </>
  );
};

export default HarthMembersSettings;
