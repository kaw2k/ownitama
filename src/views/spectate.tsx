import * as React from 'react'
import {
  GameState,
  PlayerLobby,
  LobbyState,
  Game as _Game,
} from '../interfaces'
import { CardView } from '../components/card'
import { winningPlayer } from '../helpers'
import { makeGame } from '../actions'
import { updateFirebase } from '../helpers/firebase'
import { Chat } from '../components/chat'
import { Helmet } from 'react-helmet'
import { Token } from '../components/token'
import { Player } from '../components/player'

const getCurrentGame = (game: GameState): _Game => {
  return game.game[0]
}

interface Props {
  player: PlayerLobby
  game: GameState
  gameName: string
}

interface State {
  message: string
}

export class Spectate extends React.Component<Props, State> {
  state: State = {
    message: '',
  }

  render() {
    const { game, player } = this.props
    const currentGame = getCurrentGame(game)
    const gameOver = winningPlayer(currentGame)

    const activePlayer = currentGame.players[0]

    const blue =
      currentGame.players[0].color == 'blue'
        ? currentGame.players[0]
        : currentGame.players[1]

    const red =
      currentGame.players[0].color == 'red'
        ? currentGame.players[0]
        : currentGame.players[1]

    return (
      <div className="game">
        <Helmet>
          <title>{this.props.gameName} - Ownitama</title>
        </Helmet>

        <div className="board">
          {currentGame.board.map((row, x) => (
            <ul>
              {row.map((tile, y) => (
                <li className={`tile-${x}-${y}`}>
                  {tile && <Token disabled piece={tile} />}
                </li>
              ))}
            </ul>
          ))}
        </div>

        <div className="game-meta">
          {gameOver ? (
            <>
              <h1>
                {currentGame.players[0].color === gameOver
                  ? currentGame.players[0].name
                  : currentGame.players[1].name}{' '}
                wins!
              </h1>
              <button
                className="action"
                onClick={() => {
                  updateFirebase({
                    type: 'game',
                    chat: null,
                    game: [makeGame(currentGame.players)],
                  })
                }}>
                rematch (new cards)
              </button>
              <button
                className="action"
                onClick={() => {
                  updateFirebase({
                    type: 'game',
                    chat: null,
                    game: [
                      makeGame(currentGame.players, [
                        currentGame.card,
                        ...currentGame.players[0].cards,
                        ...currentGame.players[1].cards,
                      ] as LobbyState['cards']),
                    ],
                  })
                }}>
                rematch (same cards)
              </button>
              <button
                className="action"
                onClick={() => {
                  updateFirebase({
                    type: 'lobby',
                    players: currentGame.players,
                    cards: null,
                    chat: null,
                  })
                }}>
                back to lobby
              </button>
            </>
          ) : (
            <>
              <h3>Spectating</h3>
              <button
                className="action"
                onClick={() => {
                  updateFirebase({
                    type: 'lobby',
                    chat: null,
                    players: null,
                    cards: null,
                  })
                }}>
                end game
              </button>

              <Player invert player={blue} />
              <div className="spare-card">
                <CardView
                  invert={activePlayer.color === 'blue'}
                  card={currentGame.card}
                />
              </div>
              <Player player={red} />
            </>
          )}
        </div>

        <Chat
          chats={game.chat}
          onSubmit={message => {
            updateFirebase({
              ...game,
              chat: [
                { message, playerName: player.name },
                ...(game.chat || []),
              ],
            })
          }}
        />
      </div>
    )
  }
}
