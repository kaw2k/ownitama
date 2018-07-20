import * as React from 'react'
import { subscribeToFirebase, updateFirebaseGame } from '../helpers/firebase'
import {
  FirebaseGameState,
  LobbyStateDefault,
  FirebaseUserState,
} from '../interfaces'
import { Game } from './game'
import { Lobby } from './lobby'
import { getPlayer } from '../helpers/localstorage'
import { Login } from './login'
import { getPath } from '../helpers/url'
import { MainLobby } from './mainLobby'
import { setPresence } from '../helpers/firebase'

const Loading = () => <div>Loading...</div>

interface State {
  gameState: FirebaseGameState
  userState: FirebaseUserState
}

export class App extends React.Component<{}, State> {
  state: State = { gameState: { type: 'loading' }, userState: {} }

  componentDidMount() {
    subscribeToFirebase({
      gameState: state => {
        const player = getPlayer()
        if (state) {
          this.setState({
            gameState: { ...LobbyStateDefault, ...state } as any,
          })
        } else if (player) {
          updateFirebaseGame({ ...LobbyStateDefault, players: [player] })
        }
      },
      presenceState: state => {
        this.setState({ userState: state })
      },
    })
  }

  render() {
    const player = getPlayer()

    if (!player) return <Login />

    setPresence(player)

    if (this.state.gameState.type === 'loading') return <Loading />

    if (this.state.gameState.type === 'main-lobby')
      return <MainLobby player={player} />

    if (this.state.gameState.type === 'game')
      return (
        <Game
          player={player}
          game={this.state.gameState}
          gameName={getPath()}
          userPresence={this.state.userState}
        />
      )

    if (this.state.gameState.type === 'lobby')
      return (
        <Lobby
          player={player}
          lobby={this.state.gameState}
          lobbyName={getPath()}
          userPresence={this.state.userState}
        />
      )
  }
}
