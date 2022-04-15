import { Button } from '../../../../../components/Common'

import styles from './TurnKeeper.module.scss'

const MyTurn = ({ endTurnHandler }) => {
  const exisitingIcon = document.getElementById('turn-keeper-icon')
  if (exisitingIcon) {
    exisitingIcon.remove()
  }
  return (
    <div className={styles.MyTurn}>
      <Button
        className={styles.MyTurnEnd}
        onClick={endTurnHandler}
        text="Finish Turn"
      />
    </div>
  )
}

export default MyTurn
