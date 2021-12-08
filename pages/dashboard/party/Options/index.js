import { useState } from 'react'

import DiceRoller from './Dice'
import VoteCaller from './Vote'

const Options = (props) => {
  const { diceRollHandler } = props
  const [diceOpen, setDiceOpen] = useState(false)
  const [voteOpen, setVoteOpen] = useState(false)

  const toggleDiceRoll = () => {
    setDiceOpen(!diceOpen)
  }

  const toggleVote = () => {
    setVoteOpen(!voteOpen)
  }

  return (
    <>
      <div id="options_menu">
        <div id="options_menu_container">
          <button id="vote" onClick={toggleVote}>
            vote
          </button>
          <button id="dice" onClick={toggleDiceRoll}>
            roll dice
          </button>
          <button id="turn-keeper">turn keeper</button>
        </div>
        {diceOpen ? <DiceRoller diceRollHandler={diceRollHandler} /> : null}
        {voteOpen ? <VoteCaller /> : null}
      </div>
    </>
  )
}

export default Options
