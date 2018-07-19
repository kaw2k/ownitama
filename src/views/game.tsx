import * as React from 'react'
import {
  GameState,
  PlayerLobby,
  Coordinate,
  Absolute,
  LobbyState,
  Game as _Game,
} from 'interfaces'
import { CardView } from '../components/card'
import { possibleMoves, equalCoordinates, winningPlayer } from '../helpers'
import { makeMove, makeGame } from '../actions'
import { updateFirebase } from '../helpers/firebase'
import { notifyTurn, askPermission, notifyChat } from '../helpers/notify'
import { Chat } from '../components/chat'
import { Helmet } from 'react-helmet'
import { Spectate } from './spectate'
import { Token } from '../components/token'
import { Player } from '../components/player'
import {
  getNotificationSettings,
  setNotificationSettings,
} from '../helpers/localstorage'

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
  origin: Coordinate<Absolute> | null
  decideCard: Coordinate<Absolute> | null
  notifyChat?: boolean
}

export class Game extends React.Component<Props, State> {
  private notifyTurn: boolean = false

  state: State = {
    message: '',
    origin: null,
    decideCard: null,
    notifyChat: getNotificationSettings().chat,
  }

  componentDidMount() {
    askPermission()
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    const currentGame = getCurrentGame(this.props.game)
    const previousGame = getCurrentGame(prevProps.game)
    const you = this.props.player

    if (currentGame.players[0].id !== previousGame.players[0].id) {
      if (currentGame.players[0].id == you.id) {
        document.title = `* ${document.title}`
        notifyTurn()
      } else if (document.title.includes('*')) {
        document.title = `${document.title.slice(2)}`
      }
    }

    if (
      this.state.notifyChat &&
      (this.props.game.chat || []).length !==
        (prevProps.game.chat || []).length &&
      this.props.game.chat![0].id !== this.props.player.id
    ) {
      notifyChat(this.props.game.chat![0])
    }
  }

  render() {
    const { game, player } = this.props
    const currentGame = getCurrentGame(game)

    const isUserPlaying = !!currentGame.players.find(
      p => p.id === player.id && p.name === player.name
    )
    if (!isUserPlaying)
      return (
        <Spectate
          game={this.props.game}
          gameName={this.props.gameName}
          player={this.props.player}
        />
      )

    const you =
      currentGame.players[0].id === player.id
        ? currentGame.players[0]
        : currentGame.players[1]
    const opponent =
      currentGame.players[0].id === player.id
        ? currentGame.players[1]
        : currentGame.players[0]

    const isActivePlayer = you.id === currentGame.players[0].id

    const moves = this.state.origin
      ? possibleMoves(currentGame, this.state.origin)
      : []

    const gameOver = winningPlayer(currentGame)

    // Notify the player that it is their turn
    if (!this.notifyTurn && isActivePlayer) {
      notifyTurn()
      this.notifyTurn = true
    } else if (this.notifyTurn && !isActivePlayer) {
      this.notifyTurn = false
    }

    return (
      <div className="game">
        <Helmet>
          <title>
            {`${isActivePlayer ? '* ' : ''}${this.props.gameName} - Ownitama`}
          </title>
        </Helmet>

        <div className={`board ${you.color === 'blue' ? 'invert' : ''}`}>
          {currentGame.board.map((row, x) => (
            <ul>
              {row.map((tile, y) => (
                <li className={`tile-${x}-${y}`}>
                  {tile && (
                    <Token
                      disabled={
                        !isUserPlaying ||
                        tile.color !== you.color ||
                        !isActivePlayer ||
                        !!gameOver
                      }
                      onClick={() =>
                        this.setState({
                          decideCard: null,
                          origin:
                            this.state.origin &&
                            equalCoordinates([x, y] as any, this.state.origin)
                              ? null
                              : ([x, y] as any),
                        })
                      }
                      piece={tile}
                    />
                  )}

                  {moves.find(move => equalCoordinates(move, [x, y] as any)) &&
                    isActivePlayer &&
                    isUserPlaying && (
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
                            updateFirebase({
                              ...this.props.game,
                              game: [move, ...game.game],
                            })
                            this.setState({ origin: null, decideCard: null })
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

        <div className="game-meta">
          {this.state.decideCard && isActivePlayer ? (
            <>
              <h3>which card did you want to use?</h3>

              <button
                className="cancel"
                onClick={() => {
                  this.setState({ origin: null, decideCard: null })
                }}>
                cancel
              </button>

              {you.cards.map(card => (
                <button
                  key={card.name}
                  onClick={() => {
                    if (!this.state.origin || !this.state.decideCard) return

                    const move = makeMove(
                      currentGame,
                      this.state.origin,
                      this.state.decideCard,
                      card
                    )

                    if (typeof move === 'object') {
                      updateFirebase({
                        ...this.props.game,
                        game: [move, ...game.game],
                      })
                      this.setState({ origin: null })
                    }
                    this.setState({ origin: null, decideCard: null })
                  }}>
                  <CardView card={card} />
                </button>
              ))}
            </>
          ) : gameOver ? (
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
              {isUserPlaying && (
                <button
                  className="action"
                  onClick={() => {
                    updateFirebase({
                      ...game,
                      game: game.game.slice(1),
                    })
                  }}
                  disabled={isActivePlayer || game.game.length === 1}>
                  undo
                </button>
              )}

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

              <Player invert player={opponent} />
              <div className="spare-card">
                <h3 className="turn-name">{isActivePlayer ? 'you' : 'them'}</h3>
                <CardView invert={!isActivePlayer} card={currentGame.card} />
              </div>
              <Player player={you} />
            </>
          )}
        </div>

        <div style={{ width: '100%', marginTop: '1rem' }}>
          <input
            type="checkbox"
            checked={this.state.notifyChat}
            onChange={event => {
              setNotificationSettings({ chat: true })
              this.setState({ notifyChat: event.target.checked })
            }}
          />{' '}
          Notify on Chat
        </div>

        <Chat
          chats={game.chat}
          onSubmit={message => {
            updateFirebase({
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
