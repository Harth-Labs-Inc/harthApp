import { useEffect, useState } from 'react'

import styles from './OutsideCalls/Vote.module.scss'

const VoteCaller = (props) => {
  const { voteCallHandler, userVote, outsideVoteCall, voteResults } = props
  const [voteCalled, setVoteCalled] = useState(false)
  const [voteType, setVoteType] = useState('majority')

  const startVote = () => {
    setVoteCalled(true)

    voteCallHandler({ voteType })
  }

  const SelfVote = () => {
    const [timeLeft, setTimeLeft] = useState()
    const [userChoice, setUserChoice] = useState()

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
        setVoteCalled(false)
        setTimeLeft(undefined)
      }
    }, [timeLeft])

    const voteChoiceSubmit = (choice) => {
      setTimeLeft(undefined)
      setUserChoice(choice)
      userVote(choice)
      setVoteCalled(false)
    }

    return (
      <div className={styles.VoteModuleContent}>
        <div className={styles.VoteModuleContentTitle}>
          {outsideVoteCall.userName} <br /> called a {outsideVoteCall.voteType}{' '}
          vote
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
    )
  }
  const VoteResult = () => {
    if (voteResults) {
      return <div className={styles.VotePass}>Pass</div>
    } else if (voteResults === false) {
      return <div className={styles.VoteFail}>Fail</div>
    }
  }

  const VoteComponent = () => {
    if (voteCalled) {
      return <SelfVote />
    } else if (voteResults !== undefined) {
      return <VoteResult />
    } else {
      return (
        <div id="call_vote">
          <div id="call_vote_title">
            <button onClick={startVote}>Call Vote</button>
          </div>
          <div id="call_vote_container">
            <input
              type="radio"
              id="call_vote_unanimous"
              name="vote-type"
              onChange={() => setVoteType('unanimous')}
            />
            <label className="vote-choice" htmlFor="call_vote_unanimous">
              Unanimous
            </label>
            <input
              type="radio"
              id="call_vote_majority"
              name="vote-type"
              defaultChecked
              onChange={() => setVoteType('majority')}
            />
            <label className="vote-choice" htmlFor="call_vote_majority">
              Majority &gt; 50%
            </label>
          </div>
        </div>
      )
    }
  }

  return (
    <div id="vote_box">
      <VoteComponent />
    </div>
  )
}

export default VoteCaller
