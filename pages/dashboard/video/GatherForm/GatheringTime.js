import { useGatheringFormState } from "./GatheringFormContext";

import { Input } from "../../../../components/Common";

export function GatheringTime(props) {
    const { validate } = props;
    const { state, dispatch } = useGatheringFormState();

    let today = new Date();
    let day = today.getDate();
    let month = today.getMonth() + 1;
    const year = today.getFullYear();

    if (day < 10) {
        day = "0" + day;
    }
    if (month < 10) {
        month = "0" + month;
    }

    today = `${year}-${month}-${day}`;

    if (state) {
        return (
            <>
                <h3>Pick a time</h3>
                <form>
                    <fieldset id="gathering_setup_time">
                        <Input
                            id="gathering_date"
                            title="choose date of gathering"
                            type="date"
                            min={today}
                            value={state.gatheringDate}
                            onChange={(e) =>
                                dispatch({
                                    type: "GATHERING_DATE_CHANGE",
                                    payload: e.target.value,
                                })
                            }
                            isrequired={
                                validate.includes("gathering_date")
                                    ? true
                                    : false
                            }
                        />
                        <Input
                            id="gathering_time"
                            title="Choose time of gathering"
                            type="time"
                            value={state.gatheringTime}
                            onChange={(e) =>
                                dispatch({
                                    type: "GATHERING_TIME_CHANGE",
                                    payload: e.target.value,
                                })
                            }
                            isrequired={
                                validate.includes("gathering_time")
                                    ? true
                                    : false
                            }
                        />
                    </fieldset>
                </form>
            </>
        );
    }
}

export default GatheringTime;
