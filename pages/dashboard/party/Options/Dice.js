import { useState } from 'react'

const DiceRoller = () => {
  const [diceRolled, setDiceRolled] = useState(false)
  const [dieSides, setDieSides] = useState()
  const [result, setResult] = useState()

  const rollDicer = (sides) => {
    setDiceRolled(true)
    setDieSides(sides)

    setResult(Math.floor(Math.random() * sides) + 1)
  }

  const DiceSelector = () => {
    return (
      <>
        <button id="d4" onClick={() => rollDicer(4)}>
          d4
        </button>
        <button id="d6" onClick={() => rollDicer(6)}>
          d6
        </button>
        <button id="d8" onClick={() => rollDicer(8)}>
          d8
        </button>
        <button id="d10" onClick={() => rollDicer(10)}>
          d10
        </button>
        <button id="d12" onClick={() => rollDicer(12)}>
          d12
        </button>
        <button id="d20" onClick={() => rollDicer(20)}>
          d20
        </button>
      </>
    )
  }

  const DiceRoll = () => {
    return (
      <div id="roll_result">
        <div id="roll_result_title">You rolled a...</div>
        <div id="roll_result_container">
          <span id="roll_result_value">{result}</span>
          <span className="divider">|</span>
          <span id="roll_result_die" className={`d${dieSides}`}>
            {dieSides}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div id="dice_container">
      {diceRolled ? <DiceRoll /> : <DiceSelector />}
    </div>
  )
}

export default DiceRoller
