import {
  Absolute,
  Coordinate,
  FirebaseUserState,
  GameState,
  LobbyState,
  PlayerLobby,
  Piece,
  PlayerGame,
} from '../interfaces'
import * as React from 'react'
import { Helmet } from 'react-helmet'
import { makeGame, makeMove } from '../actions'
import { Chat } from '../components/chat'
import { Player } from '../components/player'
import { Token } from '../components/token'
import { equalCoordinates } from '../helpers/coordinates'
import { updateFirebaseGame } from '../helpers/firebase'
import { isGameOver } from '../helpers/isGameOver'
import { possibleMoves } from '../helpers/moves'
import { askPermission, notifyTurn } from '../helpers/notify'
import { Spectate } from './spectate'
import { isPlayer } from '../helpers/player'
import './game.scss'
import { CardView } from '../components/card'

interface Props {
  player: PlayerLobby
  game: GameState
  gameName: string
  userPresence: FirebaseUserState
}

interface State {
  message: string
  origin: Coordinate<Absolute> | null
  decideCard: Coordinate<Absolute> | null
}

export class Game extends React.Component<Props, State> {
  private notifyTurn: boolean = false

  state: State = {
    message: '',
    origin: null,
    decideCard: null,
  }

  componentDidMount() {
    askPermission()
  }

  render() {
    const { game, player } = this.props
    const currentGame = game.game[0]

    if (!currentGame.players.find(isPlayer(player))) {
      return (
        <Spectate
          game={this.props.game}
          gameName={this.props.gameName}
          player={this.props.player}
          userPresence={this.props.userPresence}
        />
      )
    }

    let you: PlayerGame, opponent: PlayerGame, isActivePlayer: boolean
    if (isPlayer(currentGame.players[0], player)) {
      isActivePlayer = true
      you = currentGame.players[0]
      opponent = currentGame.players[1]
    } else {
      isActivePlayer = false
      you = currentGame.players[1]
      opponent = currentGame.players[0]
    }

    const moves = this.state.origin
      ? possibleMoves(currentGame, this.state.origin)
      : []

    const gameOver = isGameOver(currentGame)

    // Notify the player that it is their turn
    if (!this.notifyTurn && isActivePlayer) {
      notifyTurn()
      this.notifyTurn = true
    } else if (this.notifyTurn && !isActivePlayer) {
      this.notifyTurn = false
    }

    return (
      <>
        <Helmet>
          <title>
            {`${isActivePlayer ? '* ' : ''}${this.props.gameName} - Ownitama`}
          </title>
        </Helmet>

        <div>
          <div className={`game-container`}>
            <CardView
              className="spare-card"
              card={currentGame.card}
              invert={!isActivePlayer}
            />
            <div className="game">
              <Player
                statuses={this.props.userPresence}
                player={opponent}
                invert
              />

              <div className={`board ${you.color === 'blue' ? 'invert' : ''}`}>
                {currentGame.board.map((row, x) => (
                  <ul>
                    {row.map((tile, y) => (
                      <li className={`tile-${x}-${y}`}>
                        {tile && (
                          <Token
                            disabled={
                              tile.color !== you.color ||
                              !isActivePlayer ||
                              !!gameOver
                            }
                            onClick={() =>
                              this.setState({
                                decideCard: null,
                                origin:
                                  this.state.origin &&
                                  equalCoordinates(
                                    [x, y] as any,
                                    this.state.origin
                                  )
                                    ? null
                                    : ([x, y] as any),
                              })
                            }
                            piece={tile}
                          />
                        )}

                        {/* Display the last move of the game */}
                        {currentGame.lastMove &&
                          equalCoordinates(currentGame.lastMove.origin, [
                            x,
                            y,
                          ] as Coordinate<Absolute>) && (
                            <Token
                              className="last-move"
                              disabled
                              piece={
                                currentGame.board[
                                  currentGame.lastMove.target[0]
                                ][currentGame.lastMove.target[1]] as Piece
                              }
                            />
                          )}

                        {moves.find(move =>
                          equalCoordinates(move, [x, y] as any)
                        ) &&
                          isActivePlayer && (
                            <button
                              className="possible-move"
                              type="button"
                              onClick={() => {
                                if (!this.state.origin) return

                                const move = makeMove(
                                  currentGame,
                                  this.state.origin as any,
                                  [x, y] as any
                                )

                                if (typeof move === 'object') {
                                  updateFirebaseGame({
                                    ...this.props.game,
                                    game: [move, ...game.game],
                                  })
                                  this.setState({
                                    origin: null,
                                    decideCard: null,
                                  })
                                } else {
                                  this.setState({ decideCard: [x, y] as any })
                                }
                              }}
                            />
                          )}
                      </li>
                    ))}
                  </ul>
                ))}
              </div>

              <Player
                statuses={this.props.userPresence}
                player={you}
                decideCard={!!this.state.decideCard}
                cardDecided={card => {
                  if (!this.state.origin || !this.state.decideCard) return

                  const move = makeMove(
                    currentGame,
                    this.state.origin,
                    this.state.decideCard,
                    card
                  )

                  if (typeof move === 'object') {
                    updateFirebaseGame({
                      ...this.props.game,
                      game: [move, ...game.game],
                    })
                    this.setState({ origin: null })
                  }
                  this.setState({ origin: null, decideCard: null })
                }}
              />
            </div>
          </div>
        </div>

        <div className="game-meta">
          <div className="game-actions">
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
                    updateFirebaseGame({
                      type: 'game',
                      chat: null,
                      game: [makeGame(currentGame.players)],
                    })
                  }}>
                  new game
                </button>
                <button
                  className="action"
                  onClick={() => {
                    updateFirebaseGame({
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
                  rematch
                </button>
                <button
                  className="action"
                  onClick={() => {
                    updateFirebaseGame({
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
                <button
                  className="action"
                  onClick={() => {
                    updateFirebaseGame({
                      ...game,
                      game: game.game.slice(1),
                    })
                  }}
                  disabled={isActivePlayer || game.game.length === 1}>
                  undo
                </button>

                <button
                  className="action"
                  onClick={() => {
                    updateFirebaseGame({
                      type: 'lobby',
                      chat: null,
                      players: null,
                      cards: null,
                    })
                  }}>
                  end game
                </button>
              </>
            )}
          </div>

          <Chat
            player={this.props.player}
            chats={game.chat}
            userPresence={this.props.userPresence}
            onSubmit={message => {
              updateFirebaseGame({
                ...game,
                chat: [
                  { message, playerName: player.name, id: player.id },
                  ...(game.chat || []),
                ],
              })
            }}
          />
        </div>
      </>
    )
  }
}
