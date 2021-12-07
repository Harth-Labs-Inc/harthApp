import { useGatheringFormState } from './GatheringFormContext'

import Input from '../../../../components/Common/Input'

export function GatheringTime(props) {
  const { validate } = props
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
          <Input
            id="gathering_date"
            title="choose date of gathering"
            type="date"
            min={today}
            value={gatheringDate}
            onChange={(e) =>
              dispatch({
                type: 'GATHERING_DATE_CHANGE',
                payload: e.target.value,
              })
            }
            isrequired={validate.includes('gathering_date') ? 'true' : ''}
          />
          <Input
            id="gathering_time"
            title="Choose time of gathering"
            type="time"
            value={gatheringTime}
            onChange={(e) =>
              dispatch({
                type: 'GATHERING_TIME_CHANGE',
                payload: e.target.value,
              })
            }
            isrequired={validate.includes('gathering_time') ? 'true' : ''}
          />
        </fieldset>
      </form>
    </>
  )
}

export default GatheringTime
