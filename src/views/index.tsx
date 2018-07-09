import * as React from 'react'
import { subscribeToFirebase, updateFirebase } from '../helpers/firebase'
import { FirebaseState, LobbyStateDefault } from '../interfaces'
import { Game } from './game'
import { Lobby } from './lobby'
import { getPlayer } from '../helpers/localstorage'
import { Login } from './login'
import { getPath } from '../helpers/url'
import { MainLobby } from './mainLobby'

const Loading = () => <div>Loading...</div>

export class App extends React.Component<{}, FirebaseState> {
  state: FirebaseState = { type: 'loading' }

  componentDidMount() {
    subscribeToFirebase(state => {
      const player = getPlayer()
      if (state) {
        this.setState({ ...LobbyStateDefault, ...state })
      } else if (player) {
        updateFirebase({ ...LobbyStateDefault, players: [player] })
      }
    })
  }

  render() {
    const player = getPlayer()
    console.log(this.state.type)

    if (!player) return <Login />

    if (this.state.type === 'loading') return <Loading />

    if (this.state.type === 'main-lobby') return <MainLobby player={player} />

    if (this.state.type === 'game')
      return <Game player={player} game={this.state} />

    if (this.state.type === 'lobby')
      return <Lobby player={player} lobby={this.state} lobbyName={getPath()} />
  }
}
