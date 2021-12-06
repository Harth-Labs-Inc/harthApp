import { useState } from 'react'

import { saveRoom } from '../../../../requests/rooms'

import GatheringText from './GatheringText'
import GatheringType from './GatheringType'
import GatheringTime from './GatheringTime'
import { useGatheringFormState } from './GatheringFormContext'

import { Button } from '../../../../components/Common/Button'

function GatherForm(props) {
  const [isSchedule, setIsSchedule] = useState(false)
  const { dispatch, state } = useGatheringFormState()
  const steps = [<GatheringText />, <GatheringType />, <GatheringTime />]

  function useFormProgress() {
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
            nextStep()
          }
          if (currentStep === 1) {
            handleSubmitLaunch()
          }
          if (currentStep === 2) {
            handleSubmitSchedule()
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
            nextStep()
          }}
        />
      ) : null}
    </>
  )
}

export default GatherForm
