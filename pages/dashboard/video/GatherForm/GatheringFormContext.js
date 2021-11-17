import { createContext, useContext, useMemo, useReducer } from 'react'

function gatheringReducer(state, action) {
  switch (action.type) {
    case 'GATHERING_NAME_CHANGE':
      return { ...state, roomName: action.payload }
    case 'GATHERING_DESCRIPTION_CHANGE':
      return { ...state, gatheringDescription: action.payload }
    case 'GATHERING_TYPE_CHANGE':
      return { ...state, gatheringType: action.payload }
    case 'GATHERING_DATE_CHANGE':
      return { ...state, gatheringDate: action.payload }
    case 'GATHERING_TIME_CHANGE':
      return { ...state, gatheringTime: action.payload }
    case 'SUBMIT':
      return { ...state, isSubmitLoading: true }
    case 'GATHERING_CREATED':
      return { ...state, isSubmitLoading: false }
    default:
      throw new Error()
  }
}

const CreateGatheringFormContext = createContext()

const defaultGathering = {
  roomName: '',
  gatheringDescription: '',

  gatheringType: '',

  gatheringDate: '',
  gatheringTime: '',

  isSubmitLoading: false,
  isGatheringCreated: false,
}

// const contextValue = useMemo(() => {
//   return {state, dispatch}
// }, [state, dispatch])

export const CreateGatheringFormProvider = function ({ children }) {
  const [state, dispatch] = useReducer(gatheringReducer, defaultGathering)

  return (
    <CreateGatheringFormContext.Provider value={{ state, dispatch }}>
      {children}
    </CreateGatheringFormContext.Provider>
  )
}

export function useGatheringFormState() {
  const context = useContext(CreateGatheringFormContext)

  return context
}
