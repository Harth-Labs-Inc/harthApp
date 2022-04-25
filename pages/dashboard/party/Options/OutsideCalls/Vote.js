import { useEffect, useState } from 'react'

import styles from './Vote.module.scss'

const VoteModal = (props) => {
  const { outsideVoteCall, userVote } = props
  const [showOutsideVoteModal, setShowOutsideVoteModal] = useState(false)
  const [timeLeft, setTimeLeft] = useState()
  const [userChoice, setUserChoice] = useState()

  useEffect(() => {
    if (Object.keys(outsideVoteCall).length) {
      setShowOutsideVoteModal(true)
      setTimeLeft(10)
    } else {
      setShowOutsideVoteModal(false)
      setTimeLeft(undefined)
    }
  }, [outsideVoteCall])

  useEffect(() => {
    if (timeLeft > 0) {
      setTimeout(() => {
        setTimeLeft((prevTime) => (prevTime -= 1))
      }, 1000)
    }
    if (timeLeft === 0) {
      if (!userChoice) {
        userVote('no')
      }
      setShowOutsideVoteModal(false)
      setTimeLeft(undefined)
    }
  }, [timeLeft])

  const voteChoiceSubmit = (choice) => {
    setTimeLeft(undefined)
    setUserChoice(choice)
    userVote(choice)
    setShowOutsideVoteModal(false)
  }

  if (showOutsideVoteModal) {
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

  return null
}

export default VoteModal
