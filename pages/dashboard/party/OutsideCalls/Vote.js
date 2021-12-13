import { useEffect, useState } from 'react'

const VoteModal = (props) => {
  const { outsideVoteCall, userVote } = props
  const [showOutsideVoteModal, setShowOutsideVoteModal] = useState(false)

  useEffect(() => {
    console.log('cahnge', outsideVoteCall)
    if (Object.keys(outsideVoteCall).length) {
      setShowOutsideVoteModal(true)
    }
  }, [outsideVoteCall])

  const voteChoiceSubmit = (choice) => {
    userVote(choice)
  }

  const VoteModule = () => {
    return (
      <div id="vote_module" style={{ position: 'absolute', top: 0 }}>
        <div id="vote_result">
          <div id="vote_result_title">
            {outsideVoteCall.userName} called a {outsideVoteCall.voteType} vote
          </div>
          <div id="vote_result_options">
            <input
              type="radio"
              id="vote_yeah"
              name="vote-type"
              onChange={() => voteChoiceSubmit('yeah')}
            />
            <label className="vote-choice" htmlFor="call_vote_unanimous">
              yea
            </label>
            <input
              type="radio"
              id="vote_nah"
              name="vote-type"
              onChange={() => voteChoiceSubmit('nah')}
            />
            <label className="vote-choice" htmlFor="call_vote_unanimous">
              nah
            </label>
          </div>
        </div>
      </div>
    )
  }

  return <>{showOutsideVoteModal ? <VoteModule /> : null}</>
}

export default VoteModal
