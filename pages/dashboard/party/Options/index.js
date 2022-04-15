import { useState } from 'react'

import DiceRoller from './Dice'
import VoteCaller from './Vote'
import TurnKeeper from './TurnKeeper/TurnKeeper'

const Options = (props) => {
  const {
    diceRollHandler,
    voteCallHandler,
    userVote,
    peers,
    turnCallHandler,
    openTurnKeeper,
    activeTurnUser,
    turnKeeperToggleHandler,
    outsideVoteCall,
    voteResults,
  } = props
  const [diceOpen, setDiceOpen] = useState(false)
  const [voteOpen, setVoteOpen] = useState(false)
  const [turnOpen, setTurnOpen] = useState(false)

  const toggleDiceRoll = () => {
    setDiceOpen(!diceOpen)
  }

  const toggleVote = () => {
    setVoteOpen(!voteOpen)
  }

  const toggleTurnKeeper = () => {
    setTurnOpen(!turnOpen)
  }

  console.log(voteResults)

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
          <button id="turn-keeper" onClick={toggleTurnKeeper}>
            turn keeper
          </button>
        </div>
        {diceOpen ? <DiceRoller diceRollHandler={diceRollHandler} /> : null}
        {voteOpen ? (
          <VoteCaller
            voteCallHandler={voteCallHandler}
            userVote={userVote}
            outsideVoteCall={outsideVoteCall}
            voteResults={voteResults}
          />
        ) : null}
        {turnOpen ? (
          <TurnKeeper
            peers={peers}
            turnCallHandler={turnCallHandler}
            openTurnKeeper={openTurnKeeper}
            activeTurnUser={activeTurnUser}
            turnKeeperToggleHandler={turnKeeperToggleHandler}
          />
        ) : null}
      </div>
    </>
  )
}

export default Options
