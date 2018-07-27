import * as React from 'react'
import { GamePreview, PlayerLobby } from '../interfaces'
import { isPlayer } from '../helpers/player'
import { getPath } from '../helpers/url'
import './previews.scss'

interface Props {
  previews: GamePreview[]
  user: PlayerLobby
}

export const Previews: React.SFC<Props> = ({ previews, user }) => {
  const yourTurn = (game: GamePreview) => isPlayer(game.players[0], user)
  const path = getPath()
  const games = previews.filter(game => game.path !== path)

  if (!games.length) return null

  return (
    <div className="game-previews">
      <h3>Your Games:</h3>
      {games.map(game => (
        <a href={`/${game.path}`}>
          {yourTurn(game) ? '●' : '○'}
          {game.path}
        </a>
      ))}
    </div>
  )
}
