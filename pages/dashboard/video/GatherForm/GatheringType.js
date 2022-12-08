import { useGatheringFormState } from "./GatheringFormContext";

export function GatheringType(props) {
    const { validate } = props;
    const { state, dispatch } = useGatheringFormState();

    if (state) {
        return (
            <>
                <h3>Select a type</h3>
                <form>
                    <fieldset id="gathering_setup_type">
                        <button
                            id="room_type_voice"
                            className={
                                state.gatheringType === "voice" ? "active" : ""
                            }
                            name="room_type"
                            value="voice"
                            type="button"
                            onClick={(e) => {
                                dispatch({
                                    type: "GATHERING_TYPE_CHANGE",
                                    payload: e.target.value,
                                });
                            }}
                        >
                            Voice
                            <span>Classic voice and text chat</span>
                        </button>

                        <button
                            id="room_type_stream"
                            className={
                                state.gatheringType === "stream" ? "active" : ""
                            }
                            name="room_type"
                            value="stream"
                            type="button"
                            onClick={(e) => {
                                dispatch({
                                    type: "GATHERING_TYPE_CHANGE",
                                    payload: e.target.value,
                                });
                            }}
                        >
                            Stream
                            <span>Voice and video streaming</span>
                        </button>

                        <button
                            id="room_type_party"
                            className={
                                state.gatheringType === "party" ? "active" : ""
                            }
                            name="room_type"
                            value="party"
                            type="button"
                            onClick={(e) => {
                                dispatch({
                                    type: "GATHERING_TYPE_CHANGE",
                                    payload: e.target.value,
                                });
                            }}
                        >
                            Party
                            <span>Video chat for gaming</span>
                        </button>
                        <p id="gathering_setup_type_error">
                            {validate?.includes("room_type")
                                ? "Must choose a room type"
                                : ""}
                        </p>
                    </fieldset>
                </form>
            </>
        );
    }
}

export default GatheringType;
