import * as React from 'react'
import {
  subscribeToLobby,
  updateLobby,
  subscribeToGamePreview,
} from '../helpers/firebase'
import {
  FirebaseGameState,
  LobbyStateDefault,
  FirebaseUserState,
  GamePreview,
} from '../interfaces'
import { Game } from './game'
import { Lobby } from './lobby'
import { getPlayer } from '../helpers/localstorage'
import { Login } from './login'
import { getPath } from '../helpers/url'
import { MainLobby } from './mainLobby'
import { subscribeToPresence } from '../helpers/firebase'

const Loading = () => <div>Loading...</div>

interface State {
  gameState: FirebaseGameState
  userState: FirebaseUserState
  previewState: GamePreview[]
}

export class App extends React.Component<{}, State> {
  state: State = {
    gameState: { type: 'loading' },
    userState: {},
    previewState: [],
  }

  componentDidMount() {
    const player = getPlayer()
    if (!player) return

    subscribeToLobby(state => {
      const player = getPlayer()
      if (state) {
        this.setState({
          gameState: { ...LobbyStateDefault, ...state } as any,
        })
      } else if (player) {
        updateLobby({ ...LobbyStateDefault, players: [player] })
      }
    })

    subscribeToPresence(player, state => this.setState({ userState: state }))
    subscribeToGamePreview(player, state =>
      this.setState({ previewState: state })
    )
  }

  render() {
    const player = getPlayer()

    if (!player) return <Login />

    if (this.state.gameState.type === 'loading') return <Loading />

    if (this.state.gameState.type === 'main-lobby')
      return <MainLobby player={player} previews={this.state.previewState} />

    if (this.state.gameState.type === 'game')
      return (
        <Game
          player={player}
          game={this.state.gameState}
          gameName={getPath()}
          userPresence={this.state.userState}
          previews={this.state.previewState}
        />
      )

    if (this.state.gameState.type === 'lobby')
      return (
        <Lobby
          player={player}
          lobby={this.state.gameState}
          lobbyName={getPath()}
          userPresence={this.state.userState}
          previews={this.state.previewState}
        />
      )
  }
}
