import { useEffect, useState } from 'react'
import { useGatheringFormState } from './GatheringFormContext'

export function GatheringType() {
  const {
    state: { gatheringType },
    dispatch,
  } = useGatheringFormState()
  const [active, setActive] = useState('')

  useEffect(() => {}, [active])

  return (
    <>
      <h3>Select a type</h3>
      <form>
        <fieldset id="gathering_setup_type">
          <button
            id="room_type_voice"
            className={gatheringType === 'voice' ? 'active' : ''}
            name="room_type"
            value="voice"
            type="button"
            onClick={(e) => {
              dispatch({
                type: 'GATHERING_TYPE_CHANGE',
                payload: e.target.value,
              })
            }}
          >
            Voice
            <span>Classic voice and text chat</span>
          </button>

          <button
            id="room_type_stream"
            className={gatheringType === 'stream' ? 'active' : ''}
            name="room_type"
            value="stream"
            type="button"
            onClick={(e) => {
              dispatch({
                type: 'GATHERING_TYPE_CHANGE',
                payload: e.target.value,
              })
            }}
          >
            Stream
            <span>Voice and video streaming</span>
          </button>

          <button
            id="room_type_party"
            className={gatheringType === 'party' ? 'active' : ''}
            name="room_type"
            value="party"
            type="button"
            onClick={(e) => {
              dispatch({
                type: 'GATHERING_TYPE_CHANGE',
                payload: e.target.value,
              })
            }}
          >
            Party
            <span>Video chat for gaming</span>
          </button>
        </fieldset>
      </form>
    </>
  )
}

export default GatheringType
