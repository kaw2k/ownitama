import * as React from 'react'
import { PlayerGame, PlayerLobby, FirebaseUserState } from '../interfaces'
import { CardView } from './card'
import { hashUser } from '../helpers/firebase'

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
}> = ({ player, invert, statuses = {} }) => (
  <div className="player">
    <PlayerName className="name" player={player} statuses={statuses} />
    {player.cards.map(card => (
      <CardView key={card.name} invert={invert} card={card} />
    ))}
  </div>
)
