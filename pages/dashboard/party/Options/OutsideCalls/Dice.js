import { useEffect, useState } from 'react'

import styles from './Dice.module.scss'

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
      <div className={styles.RollModule}>
        <div className={styles.RollModuleResult}>
          <div className={styles.RollModuleResultTitle}>
            {outsideDiceRoll.userName} rolled a...
          </div>
          <div className={styles.RollModuleResultContainer}>
            <span className={styles.RollModuleResultContainerValue}>
              {outsideDiceRoll.number}
            </span>
            <span className={styles.RollModuleResultContainerDivider}>|</span>
            <span
              className={`${styles.RollModuleResultContainerDie} ${
                styles[`d${outsideDiceRoll.sides}`]
              }`}
            >
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
