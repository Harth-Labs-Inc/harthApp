import { useEffect, useState } from 'react'

const DiceModal = (props) => {
  const { outsideDiceRoll } = props
  const [showOutsideDiceModal, setShowOutsideDiceModal] = useState(false)

  useEffect(() => {
    if (Object.keys(outsideDiceRoll).length) {
      setShowOutsideDiceModal(true)

      setTimeout(() => {
        setShowOutsideDiceModal(false)
      }, 5000)
    }
  }, [outsideDiceRoll])

  const RollModule = () => {
    return (
      <div id="roll_module">
        <div id="roll_result">
          <div id="roll_result_title">
            {outsideDiceRoll.userName} rolled a...
          </div>
          <div id="roll_result_container">
            <span id="roll_result_value">{outsideDiceRoll.number}</span>
            <span className="divider">|</span>
            <span id="roll_result_die" className={`d${outsideDiceRoll.sides}`}>
              {outsideDiceRoll.sides}
            </span>
          </div>
        </div>
      </div>
    )
  }

  return <>{showOutsideDiceModal ? <RollModule /> : null}</>
}

export default DiceModal
