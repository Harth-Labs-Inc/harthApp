import TalkingHead from "../TalkingHead/TalkingHead";
import { Button, Modal } from "Common";

import { checkIfInviteTokenIsGood } from "../../requests/community";

import styles from "./harthinvite.module.scss";
import { useState } from "react";
import BlockUserModal from "components/Menus/HarthSettings/BlockUserModal/BlockUserModal";

export default function HarthInviteAcceptModal({
  talkingHeadMsg,
  submitText,
  submitHandler,
  tkn,
  user,
  closeHandler,
  footer,
  invitedHarth,
  invitedSender,
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);

  const invitationAcceptHandler = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    let results = await checkIfInviteTokenIsGood({ token: tkn, user });
    let { ok, harth } = results;

    if (ok) {
      submitHandler(harth);
    }
    setIsSubmitting(false);
  };

  const toggleBlockModal = () => {
    setShowBlockModal(!showBlockModal);
  };
  const closeInviteFromBlock = () => {
    setShowBlockModal(false);
    closeHandler();
  };

  return (
    <>
      {showBlockModal ? (
        <Modal onToggleModal={setShowBlockModal} classNames={styles.KickModal}>
          <BlockUserModal
            setHidden={setShowBlockModal}
            closeHandler={closeInviteFromBlock}
            usr={{
              name: invitedSender?.senderName,
              userId: invitedSender?.senderID,
              iconKey: invitedSender?.iconKey,
            }}
            activeUser={user}
          />
        </Modal>
      ) : (
        <Modal onToggleModal={() => {}} blockBackground={true}>
          <div className={styles.mainContainer}>
            <div className={styles.title}>Härth Invite</div>
            <TalkingHead text={talkingHeadMsg} />
            <div className={styles.harthHolder}>
              <img src={invitedHarth?.iconKey} loading="lazy" />
              <div className={styles.harthTitle}>{invitedHarth?.name}</div>
            </div>
            <form onSubmit={invitationAcceptHandler}>
              <p className={styles.footer}>{footer}</p>
              <div className={styles.buttonBar}>
                <div className={styles.sub}>
                  <Button
                    tier="primary"
                    fullWidth
                    text={submitText}
                    type="submit"
                    isLoading={isSubmitting}
                  />
                  <Button
                    tier="secondary"
                    fullWidth
                    text="Don't Accept"
                    onClick={closeHandler}
                  />
                </div>
                <Button
                  tier="secondary"
                  fullWidth
                  text={`Block all invites from ${
                    invitedSender?.senderName || "sender"
                  }`}
                  onClick={toggleBlockModal}
                  size="small"
                />
              </div>
            </form>
          </div>
        </Modal>
      )}
    </>
  );
}
