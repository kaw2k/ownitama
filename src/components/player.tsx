import * as React from 'react'
import { PlayerGame, PlayerLobby, FirebaseUserState, Card } from '../interfaces'
import { CardView } from './card'
import { hashUser } from '../helpers/firebase'
import './player.scss'

export const PlayerName: React.SFC<{
  player: PlayerLobby
  statuses: FirebaseUserState
  className?: string
  inline?: boolean
}> = ({ player, statuses, inline, className }) => {
  const status = statuses[hashUser(player)]
  const indicator = status === 'active' ? '●' : '○'
  return React.createElement(
    inline ? 'strong' : 'h3',
    { className },
    `${indicator} ${player.name}`
  )
}

export const Player: React.SFC<{
  player: PlayerGame
  invert?: boolean
  statuses?: FirebaseUserState
  decideCard?: boolean
  cardDecided?: (card: Card) => void
}> = ({ player, invert, statuses = {}, decideCard, cardDecided }) => (
  <div className={`player ${invert ? 'them' : 'you'}`}>
    {decideCard ? (
      <h3>Which card do you want to use?</h3>
    ) : (
      <PlayerName className="name" player={player} statuses={statuses} />
    )}

    <div className="card-container">
      {player.cards.map(card => (
        <button
          key={card.name}
          disabled={!decideCard}
          onClick={() => cardDecided && cardDecided(card)}>
          <CardView card={card} />
        </button>
      ))}
    </div>
  </div>
)
