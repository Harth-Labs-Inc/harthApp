import { useState } from 'react'

import { saveRoom } from '../../../../requests/rooms'

import GatheringText from './GatheringText'
import GatheringType from './GatheringType'
import GatheringTime from './GatheringTime'
import { useGatheringFormState } from './GatheringFormContext'

import { Button } from '../../../../components/Common/Button'

function GatherForm(props) {
  const [isSchedule, setIsSchedule] = useState(false)
  const [validationIds, setValidationIds] = useState([])
  const { dispatch, state } = useGatheringFormState()
  const steps = [
    <GatheringText validate={validationIds} />,
    <GatheringType validate={validationIds} />,
    <GatheringTime validate={validationIds} />,
  ]

  const useFormProgress = () => {
    const [currentStep, setCurrentStep] = useState(0)

    function nextStep() {
      setCurrentStep(currentStep + 1)
    }

    function previousStep() {
      setCurrentStep(currentStep - 1)
    }

    function customStep(step) {
      setCurrentStep(step)

      if (currentStep !== 2) {
        setIsSchedule(false)
      }
    }

    return [currentStep, nextStep, previousStep, customStep]
  }

  const [currentStep, nextStep, previousStep, customStep] = useFormProgress()

  const ButtonText = () => {
    if (currentStep === 0) {
      return 'Continue'
    } else if (currentStep === 1) {
      return 'Launch'
    } else {
      return 'Create'
    }
  }

  const checkValidation = () => {
    let validations = []
    switch (currentStep) {
      case 0:
        if (!state.roomName.trim()) {
          validations.push('roomName')
        }
        break
      case 1:
        if (!state.gatheringType) {
          validations.push('room_type')
        }
        break
      case 2:
        if (!state.gatheringDate) {
          validations.push('gathering_date')
        }
        if (!state.gatheringTime) {
          validations.push('gathering_time')
        }
        break
      default:
        break
    }
    setValidationIds(validations)
    if (validations.length) {
      return false
    }
    return true
  }

  async function handleSubmitLaunch() {
    dispatch({ type: 'SUBMIT' })
    props.createRoomFormSubmit(state)
  }

  // async function handleSubmitSchedule() {
  //   dispatch({ type: 'SUBMIT' })
  //   const data = await saveRoom(state)

  //   let { id, ok } = data || {}
  //   if (ok) {
  //     if (id) {
  //       // room._id = id
  //       // broadcastRoom(room)
  //       dispatch({ type: 'GATHERING_CREATED' })
  //     }
  //   }
  // }

  function handleSubmitSchedule() {
    dispatch({ type: 'SUBMIT' })
    dispatch({ type: 'GATHERING_CREATED' })
  }

  if (state.isSubmitLoading) {
    return <div>Creating Gathering</div>
  }

  if (state.isGatheringCreated) {
    return <div>Created</div>
  }

  return (
    <>
      {currentStep !== 0 ? (
        <button class="form-back" onClick={() => previousStep()}>
          previous step
        </button>
      ) : null}

      {steps[currentStep]}

      <ul id="form_step_list">
        <li
          id="form_step_one"
          className={currentStep === 0 ? 'active' : null}
        ></li>
        <li
          id="form_step_two"
          className={currentStep === 1 ? 'active' : null}
        ></li>
        {isSchedule ? (
          <li
            id="form_step_three"
            className={currentStep === 2 ? 'active' : null}
          ></li>
        ) : null}
      </ul>
      <Button
        id="gathering_button"
        type="submit"
        text={ButtonText()}
        onClick={(e) => {
          e.preventDefault()
          if (currentStep === 0) {
            const isValid = checkValidation()
            if (isValid) nextStep()
          }
          if (currentStep === 1) {
            const isValid = checkValidation()
            if (isValid) handleSubmitLaunch()
          }
          if (currentStep === 2) {
            const isValid = checkValidation()
            if (isValid) handleSubmitSchedule()
          }
        }}
      />
      {currentStep === 1 ? (
        <Button
          id="gathering_schedule"
          text="Schedule"
          onClick={(e) => {
            e.preventDefault()
            setIsSchedule(true)
            const isValid = checkValidation()
            if (isValid) nextStep()
          }}
        />
      ) : null}
    </>
  )
}

export default GatherForm
