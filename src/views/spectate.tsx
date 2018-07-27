import * as React from 'react'
import { Helmet } from 'react-helmet'
import { makeGame } from '../actions'
import { CardView } from '../components/card'
import { Chat } from '../components/chat'
import { Player } from '../components/player'
import { Token } from '../components/token'
import { updateLobby } from '../helpers/firebase'
import { isGameOver } from '../helpers/isGameOver'
import {
  Game as _Game,
  GameState,
  PlayerLobby,
  FirebaseUserState,
  LobbyState,
} from '../interfaces'

const getCurrentGame = (game: GameState): _Game => {
  return game.game[0]
}

interface Props {
  player: PlayerLobby
  game: GameState
  gameName: string
  userPresence: FirebaseUserState
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
    const gameOver = isGameOver(currentGame)

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
                  updateLobby({
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
                  updateLobby({
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
                  updateLobby({
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
                  updateLobby({
                    type: 'lobby',
                    chat: null,
                    players: null,
                    cards: null,
                  })
                }}>
                end game
              </button>

              <Player statuses={this.props.userPresence} invert player={blue} />
              <div className="spare-card">
                <CardView
                  invert={activePlayer.color === 'blue'}
                  card={currentGame.card}
                />
              </div>
              <Player statuses={this.props.userPresence} player={red} />
            </>
          )}
        </div>

        <Chat
          chats={game.chat}
          userPresence={this.props.userPresence}
          onSubmit={message => {
            updateLobby({
              ...game,
              chat: [
                { message, playerName: player.name, id: player.id },
                ...(game.chat || []),
              ],
            })
          }}
        />
      </div>
    )
  }
}
