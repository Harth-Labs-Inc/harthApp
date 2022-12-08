import { useEffect, useState } from "react";

import { updateScheduleRoom } from "../../../../requests/rooms";

import GatheringText from "./GatheringText";
import GatheringType from "./GatheringType";
import GatheringTime from "./GatheringTime";
import { useGatheringFormState } from "./GatheringFormContext";
import { convertToAmPm, combineDateTime } from "../../../../services/helper";
import { useVideo } from "../../../../contexts/video";

import { Button } from "../../../../components/Common";

import styles from "./GatheringForm.module.scss";

function GatherForm(props) {
    const [isSchedule, setIsSchedule] = useState(false);
    const [validationIds, setValidationIds] = useState([]);
    const { dispatch, state } = useGatheringFormState();
    const steps = [
        <GatheringText validate={validationIds} />,
        <GatheringType validate={validationIds} />,
        <GatheringTime validate={validationIds} />,
    ];

    const { pushScheduledRoom, socketID, refreshScheduledCallRooms } =
        useVideo();

    const useFormProgress = () => {
        const [currentStep, setCurrentStep] = useState(0);

        function nextStep() {
            setCurrentStep(currentStep + 1);
        }

        function previousStep() {
            setCurrentStep(currentStep - 1);
        }

        function customStep(step) {
            setCurrentStep(step);

            if (currentStep !== 2) {
                setIsSchedule(false);
            }
        }

        return [currentStep, nextStep, previousStep, customStep];
    };

    const [currentStep, nextStep, previousStep, customStep] = useFormProgress();

    const ButtonText = () => {
        if (currentStep !== 2) {
            return "Continue";
        } else {
            return "Update";
        }
    };

    const checkValidation = () => {
        let validations = [];
        switch (currentStep) {
            case 0:
                if (!state?.roomName?.trim()) {
                    validations.push("roomName");
                }
                break;
            case 1:
                if (!state?.gatheringType) {
                    validations.push("room_type");
                }
                break;
            case 2:
                if (!state?.gatheringDate) {
                    validations.push("gathering_date");
                }
                if (!state?.gatheringTime) {
                    validations.push("gathering_time");
                }
                break;
            default:
                break;
        }
        setValidationIds(validations);
        if (validations.length) {
            return false;
        }
        return true;
    };

    async function handleSubmitSchedule() {
        console.log("update schedule room", state);
        let newRoom = { ...state };

        if (newRoom && newRoom.gatheringTime) {
            newRoom.gatheringTime = convertToAmPm(newRoom.gatheringTime);
        }

        dispatch({ type: "SUBMIT" });
        await updateScheduleRoom(newRoom);
        refreshScheduledCallRooms(newRoom);
        props.closeHandler();
    }

    if (state.isSubmitLoading) {
        return <div>Creating Gathering</div>;
    }

    if (state.isGatheringCreated) {
        return <div>Created</div>;
    }

    return (
        <>
            {currentStep !== 0 ? (
                <button className="form-back" onClick={() => previousStep()}>
                    previous step
                </button>
            ) : null}

            {steps[currentStep]}

            <ul className={styles.formStepList}>
                <li
                    id="form_step_one"
                    className={`${styles.formStepListItem} ${
                        currentStep === 0 ? styles.formStepListItemActive : null
                    }`}
                ></li>
                <li
                    id="form_step_two"
                    className={`${styles.formStepListItem} ${
                        currentStep === 1 ? styles.formStepListItemActive : null
                    }`}
                ></li>

                <li
                    id="form_step_three"
                    className={`${styles.formStepListItem} ${
                        currentStep === 2 ? styles.formStepListItemActive : null
                    }`}
                ></li>
            </ul>
            <Button
                id="gathering_button"
                type="submit"
                fullWidth={true}
                text={ButtonText()}
                onClick={(e) => {
                    e.preventDefault();
                    const isValid = checkValidation();
                    if (isValid) {
                        if (currentStep !== 2) {
                            nextStep();
                        }
                        if (currentStep === 2) {
                            handleSubmitSchedule();
                        }
                    }
                }}
            />
        </>
    );
}

export default GatherForm;
