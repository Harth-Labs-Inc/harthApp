import { useGatheringFormState } from './GatheringFormContext'

export function GatheringTime() {
  const {
    state: { gatheringDate, gatheringTime },
    dispatch,
  } = useGatheringFormState()

  let today = new Date()
  let day = today.getDate()
  let month = today.getMonth() + 1
  const year = today.getFullYear()

  if (day < 10) {
    day = '0' + day
  }
  if (month < 10) {
    month = '0' + month
  }

  today = `${year}-${month}-${day}`

  return (
    <>
      <h3>Pick a time</h3>
      <form>
        <fieldset id="gathering_setup_time">
          <label htmlFor="gathering_date">Choose date of gathering</label>
          <input
            id="gathering_date"
            type="date"
            min={today}
            value={gatheringDate}
            onChange={(e) =>
              dispatch({
                type: 'GATHERING_DATE_CHANGE',
                payload: e.target.value,
              })
            }
          />
          <label htmlFor="gathering_time">Choose time of gathering</label>
          <input
            id="gathering_time"
            type="time"
            value={gatheringTime}
            onChange={(e) =>
              dispatch({
                type: 'GATHERING_TIME_CHANGE',
                payload: e.target.value,
              })
            }
          />
        </fieldset>
      </form>
    </>
  )
}

export default GatheringTime
