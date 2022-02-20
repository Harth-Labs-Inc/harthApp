import { useGatheringFormState } from './GatheringFormContext'

import { Input, TextArea } from '../../../../components/Common'

export function GatheringText(props) {
  const { validate } = props
  const {
    state: { roomName, gatheringDescription },
    dispatch,
  } = useGatheringFormState()

  return (
    <>
      <h3>Create a gathering</h3>
      <form>
        <fieldset id="gathering_setup_text">
          <Input
            name="roomName"
            title="Gathering Name"
            onChange={(e) =>
              dispatch({
                type: 'GATHERING_NAME_CHANGE',
                payload: e.target.value,
              })
            }
            value={roomName}
            required
            maxLength="24"
            isrequired={validate.includes('roomName') ? 'true' : ''}
          />
          <TextArea
            name="gatheringDescription"
            title="Description (optional)"
            onChange={(e) =>
              dispatch({
                type: 'GATHERING_DESCRIPTION_CHANGE',
                payload: e.target.value,
              })
            }
            value={gatheringDescription}
            maxLength="106"
          />
        </fieldset>
      </form>
    </>
  )
}

export default GatheringText
