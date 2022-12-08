import { useState } from "react";

import { Button, Input } from "../../../../components/Common";
import { useGatheringFormState } from "../GatherForm/GatheringFormContext";
import styles from "./GatherCreate.module.scss";

const GatherCreate = ({ createRoomFormSubmit, createScheduleRoom }) => {
    const { state, dispatch } = useGatheringFormState();

    const checkValidation = () => {
        if (!state?.roomName?.trim() || !state?.gatheringType) {
            return true;
        }
        return false;
    };

    const handleSubmitLaunch = () => {
        createRoomFormSubmit(state);
    };

    if (state) {
        return (
            <div className={styles.gatheringCreate}>
                <div className={styles.gatheringCreateTitle}>
                    Create a Gathering
                </div>
                <Input
                    placeholder="Name"
                    onChange={(e) => {
                        dispatch({
                            type: "GATHERING_NAME_CHANGE",
                            payload: e.target.value,
                        });
                    }}
                />
                <div className={styles.gatheringCreateRoomType}>
                    <Button
                        aria-label="voice gathering"
                        tier="secondary"
                        className={`${styles.gatheringCreateRoomTypeVoice} ${
                            state?.gatheringType === "voice"
                                ? styles.gatheringCreateRoomTypeActive
                                : ""
                        }`}
                        onClick={(e) => {
                            dispatch({
                                type: "GATHERING_TYPE_CHANGE",
                                payload: "voice",
                            });
                        }}
                    />
                    <Button
                        aria-label="stream gathering"
                        tier="secondary"
                        className={`${styles.gatheringCreateRoomTypeStream} ${
                            state?.gatheringType === "stream"
                                ? styles.gatheringCreateRoomTypeActive
                                : ""
                        }`}
                        onClick={(e) => {
                            dispatch({
                                type: "GATHERING_TYPE_CHANGE",
                                payload: "stream",
                            });
                        }}
                    />
                    <Button
                        aria-label="party gathering"
                        tier="secondary"
                        className={`${styles.gatheringCreateRoomTypeParty} ${
                            state?.gatheringType === "party"
                                ? styles.gatheringCreateRoomTypeActive
                                : ""
                        }`}
                        onClick={(e) => {
                            dispatch({
                                type: "GATHERING_TYPE_CHANGE",
                                payload: "party",
                            });
                        }}
                    />
                </div>
                <div className={styles.gatheringCreateRoomControls}>
                    <Button
                        text="Schedule"
                        tier="tertiary"
                        className={styles.gatheringCreateRoomControlsSchedule}
                        onClick={() => createScheduleRoom(state)}
                    />
                    <Button
                        text="Create"
                        tier="secondary"
                        className={styles.gatheringCreateRoomControlsCreate}
                        onClick={() => {
                            handleSubmitLaunch();
                        }}
                        disabled={checkValidation()}
                    />
                </div>
            </div>
        );
    }
};

export default GatherCreate;
