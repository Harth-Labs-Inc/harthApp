import { useState } from 'react'

import DiceRoller from './Dice'

const Options = (props) => {
  const { diceRollHandler } = props
  const [diceOpen, setDiceOpen] = useState(false)

  const toggleDiceRoll = () => {
    setDiceOpen(!diceOpen)
  }

  return (
    <>
      <div id="options_menu">
        <div id="options_menu_container">
          <button id="vote">vote</button>
          <button id="dice" onClick={() => toggleDiceRoll()}>
            roll dice
          </button>
          <button id="turn-keeper">turn keeper</button>
        </div>
        {diceOpen ? <DiceRoller diceRollHandler={diceRollHandler} /> : null}
      </div>
    </>
  )
}

export default Options
