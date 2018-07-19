import * as React from 'react'
import { updateFirebase } from '../helpers/firebase'
import { PlayerLobby, LobbyState, Card } from '../interfaces'
import { Cards } from '../cards'
import { CardView } from '../components/card'
import { makeGame } from '../actions'
import { Chat } from '../components/chat'

interface Props {
  player: PlayerLobby
  lobby: LobbyState
  lobbyName: string
}

interface State {
  showCustomCards: boolean
}

export class Lobby extends React.Component<Props, State> {
  state: State = { showCustomCards: false }
  render() {
    const { lobby, player, lobbyName } = this.props
    const showCustomCards = !!(this.state.showCustomCards || lobby.cards)

    return (
      <div className="lobby">
        <h1>Lobby: {lobbyName}</h1>

        <div className="section">
          <h2>Actions</h2>

          <div className="actions">
            <button
              className="action"
              onClick={() => {
                this.setState({ showCustomCards: false })
                updateFirebase({
                  cards: null,
                  chat: null,
                  type: 'lobby',
                  players: null,
                })
              }}
              type="button">
              reset
            </button>

            <button
              className="action"
              disabled={
                !lobby.players ||
                !lobby.players.find(
                  p => p.id === player.id && p.name === player.name
                )
              }
              onClick={() => {
                updateFirebase({
                  ...lobby,
                  players:
                    lobby.players &&
                    (lobby.players.filter(
                      p => p.id !== player.id && p.name !== player.name
                    ) as any),
                })
                window.location.replace('/')
              }}
              type="button">
              leave
            </button>

            <button
              className="action"
              onClick={() => this.setState({ showCustomCards: true })}
              type="button">
              add cards
            </button>

            <button
              className="action"
              disabled={
                (!!lobby.players && lobby.players.length === 2) ||
                (!!lobby.players &&
                  !!lobby.players.find(p => p.id === player.id))
              }
              onClick={() =>
                updateFirebase({
                  ...lobby,
                  players: lobby.players
                    ? [lobby.players[0], player]
                    : [player],
                })
              }
              type="button">
              join
            </button>

            <button
              className="action"
              disabled={!lobby.players || lobby.players.length !== 2}
              onClick={() => {
                lobby.players &&
                  lobby.players.length === 2 &&
                  updateFirebase({
                    type: 'game',
                    game: [makeGame(lobby.players, lobby.cards)],
                    chat: null,
                  })
              }}
              type="button">
              start
            </button>
          </div>
        </div>

        <div className="section">
          <h2>Players:</h2>
          <ul>
            {lobby.players &&
              lobby.players.map(p => (
                <li key={p.id}>
                  {p.name}{' '}
                  {p.id === player.id &&
                    p.name === player.name && <em>(pin: {player.id})</em>}{' '}
                </li>
              ))}
          </ul>
        </div>

        {showCustomCards && (
          <>
            <div className="section">
              <h2>Cards In Use ({(lobby.cards || []).length}/5):</h2>
              <p>Missing cards will be automatically selected</p>
              <div className="cards">
                {(lobby.cards || ([] as Card[])).map(card => (
                  <button
                    key={card.name}
                    className="card-button"
                    onClick={() =>
                      updateFirebase({
                        ...lobby,
                        cards:
                          lobby.cards &&
                          (lobby.cards.filter(
                            c => c.name !== card.name
                          ) as any),
                      })
                    }>
                    <CardView card={card} />
                  </button>
                ))}
              </div>
            </div>

            <div className="section">
              <h2>Cards Available:</h2>
              <div className="cards">
                {Cards.filter(
                  card =>
                    !(
                      lobby.cards && lobby.cards.find(c => c.name === card.name)
                    )
                ).map(card => (
                  <button
                    className="card-button"
                    key={card.name}
                    disabled={!!lobby.cards && lobby.cards.length === 5}
                    onClick={() => {
                      updateFirebase({
                        ...lobby,
                        cards: (lobby.cards || ([] as any)).concat(card),
                      })
                    }}>
                    <CardView card={card} />
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        <Chat
          onSubmit={message => {
            updateFirebase({
              ...lobby,
              chat: [
                { message, playerName: player.name },
                ...(lobby.chat || []),
              ],
            })
          }}
          chats={lobby.chat}
        />
      </div>
    )
  }
}
