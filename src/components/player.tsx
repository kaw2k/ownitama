import * as React from 'react'
import { PlayerGame } from '../interfaces'
import { CardView } from './card'

export const Player: React.SFC<{ player: PlayerGame; invert?: boolean }> = ({
  player,
  invert,
}) => (
  <div className="player">
    <h3 className="name">{player.name}</h3>
    {player.cards.map(card => (
      <CardView key={card.name} invert={invert} card={card} />
    ))}
  </div>
)
