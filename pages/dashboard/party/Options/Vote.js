import { useState } from 'react'

const VoteCaller = () => {
  const [voteCalled, setVoteCalled] = useState(false)
  const [voteType, setVoteType] = useState('majority')

  const startVote = () => {
    console.log(voteType)
    // setVoteCalled(true)
  }

  const SelfVote = () => {
    return null
  }

  return (
    <div id="vote_box">
      {voteCalled ? (
        <SelfVote />
      ) : (
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
      )}
    </div>
  )
}

export default VoteCaller
