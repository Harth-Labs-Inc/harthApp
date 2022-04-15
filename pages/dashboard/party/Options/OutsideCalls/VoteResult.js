import { useEffect, useState } from 'react'

import styles from './Vote.module.scss'

const VoteResultModal = (props) => {
  const { outsideVoteCall, voteResults } = props
  const [showOutsideVoteResultModal, setShowOutsideVoteResultModal] =
    useState(false)
  const [timeLeft, setTimeLeft] = useState()

  useEffect(() => {
    if (voteResults) {
      setShowOutsideVoteResultModal(true)
      setTimeLeft(10)
    } else {
      setShowOutsideVoteResultModal(false)
      setTimeLeft(undefined)
    }
  }, [voteResults])

  useEffect(() => {
    if (timeLeft > 0) {
      setTimeout(() => {
        setTimeLeft((prevTime) => (prevTime -= 1))
      }, 1000)
    }
    if (timeLeft === 0) {
      setShowOutsideVoteModal(false)
      setTimeLeft(undefined)
    }
  }, [timeLeft])

  const VoteResultModule = () => {
    return (
      <div className={styles.VoteModule}>
        <div className={styles.VoteModuleContent}>
          <div className={styles.VoteModuleContentTitle}>
            {outsideVoteCall.userName} <br /> called a{' '}
            {outsideVoteCall.voteType} vote
          </div>
          <div className={styles.VoteModuleContentOptions}>
            <label className={styles.VoteModuleContentOptionsYes}>
              Yea Vote
              {/* <span className={styles.VoteModuleContentOptionsYesButton}>
                yea vote
              </span> */}
              <input
                type="radio"
                id="vote_yeah"
                name="vote-cast"
                onChange={() => voteChoiceSubmit('yes')}
              />
            </label>
            <label className={styles.VoteModuleContentOptionsNo}>
              Nah Vote
              {/* <span className={styles.VoteModuleContentOptionsNoButton}>
                nah vote
              </span> */}
              <input
                type="radio"
                id="vote_nah"
                name="vote-cast"
                onChange={() => voteChoiceSubmit('no')}
              />
            </label>
          </div>
          <div className={styles.VoteModuleContentTimeout}>
            {`${timeLeft}s till vote ends`}
          </div>
        </div>
      </div>
    )
  }

  return <>{showOutsideVoteResultModal ? <VoteResultModule /> : null}</>
}

export default VoteResultModal
