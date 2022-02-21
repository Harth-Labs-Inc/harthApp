import { useState } from 'react'

import { saveRoom } from '../../../../requests/rooms'

import GatheringText from './GatheringText'
import GatheringType from './GatheringType'
import GatheringTime from './GatheringTime'
import { useGatheringFormState } from './GatheringFormContext'
import { convertToAmPm, combineDateTime } from '../../../../services/helper'
import { useVideo } from '../../../../contexts/video'

import { Button } from '../../../../components/Common'

function GatherForm(props) {
  const [isSchedule, setIsSchedule] = useState(false)
  const [validationIds, setValidationIds] = useState([])
  const { dispatch, state } = useGatheringFormState()
  const steps = [
    <GatheringText validate={validationIds} />,
    <GatheringType validate={validationIds} />,
    <GatheringTime validate={validationIds} />,
  ]

  const { pushScheduledRoom, socketID } = useVideo()

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
    console.log(state)
    dispatch({ type: 'SUBMIT' })
    props.createRoomFormSubmit(state)
  }

  async function handleSubmitSchedule() {
    let newRoom = { ...state }

    if (newRoom && newRoom.gatheringTime) {
      newRoom.gatheringTime = convertToAmPm(newRoom.gatheringTime)
    }
    newRoom.harthId = props.harthId
    newRoom.hostName = props.creator.name
    newRoom.icon = props.creator.iconKey
    newRoom.harthName = props.harthName
    newRoom.socketId = socketID

    dispatch({ type: 'SUBMIT' })
    const data = await saveRoom(newRoom)

    let { id, ok } = data || {}
    if (ok) {
      if (id) {
        newRoom._id = id
        pushScheduledRoom(newRoom)
        dispatch({ type: 'GATHERING_CREATED' })
      }
    }
  }

  // function handleSubmitSchedule() {
  //   dispatch({ type: 'SUBMIT' })
  //   dispatch({ type: 'GATHERING_CREATED' })
  // }

  if (state.isSubmitLoading) {
    return <div>Creating Gathering</div>
  }

  if (state.isGatheringCreated) {
    return <div>Created</div>
  }

  return (
    <>
      {currentStep !== 0 ? (
        <button className="form-back" onClick={() => previousStep()}>
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
          const isValid = checkValidation()
          if (isValid) {
            if (currentStep === 0) {
              nextStep()
            }
            if (currentStep === 1) {
              handleSubmitLaunch()
            }
            if (currentStep === 2) {
              handleSubmitSchedule()
            }
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
