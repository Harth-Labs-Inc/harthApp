import TalkingHead from "../TalkingHead/TalkingHead";
import { Button, Modal } from "Common";

import { checkIfInviteTokenIsGood } from "../../requests/community";

import styles from "./harthinvite.module.scss";
import { useState } from "react";

export default function HarthInviteAcceptModal({
    talkingHeadMsg,
    submitText,
    submitHandler,
    tkn,
    user,
    closeHandler,
    footer,
    invitedHarth,
}) {
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    return (
        <Modal onToggleModal={() => {}} blockBackground={true}>
            <div className={styles.mainContainer}>
                <div className={styles.title}>New Härth Invite</div>
                <TalkingHead text={talkingHeadMsg} />
                <div className={styles.harthHolder}>
                    <img src={invitedHarth?.iconKey} loading="lazy" />
                    <div className={styles.harthTitle}>
                        {invitedHarth?.name}
                    </div>
                </div>
                <form onSubmit={invitationAcceptHandler}>
                    <p className={styles.footer}>{footer}</p>
                    <div className={styles.buttonBar}>
                        <Button
                            tier="primary"
                            fullWidth
                            text={submitText}
                            type="submit"
                            isLoading={isSubmitting}
                        />
                        <Button
                            tier="secondary"
                            size="small"
                            text="Don't Accept"
                            onClick={closeHandler}
                        />
                    </div>
                </form>
            </div>
        </Modal>
    );
}
