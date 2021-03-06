import * as React from 'react'
import { PlayerLobby, GamePreview } from '../interfaces'
import { setPlayer } from '../helpers/localstorage'
import Helmet from 'react-helmet'
import './mainLobby.scss'
import { Previews } from '../components/previews'

interface Props {
  player: PlayerLobby
  previews: GamePreview[]
}

export class MainLobby extends React.Component<Props> {
  lobbyName: HTMLInputElement | null = null

  joinLobby = (e: React.SyntheticEvent) => {
    e.preventDefault()

    if (!this.lobbyName || !this.lobbyName.value.trim()) return
    window.location.replace(this.lobbyName.value.trim())
  }

  render() {
    const { player, previews } = this.props

    return (
      <div className="main-lobby">
        <Helmet>
          <title>Ownitama</title>
        </Helmet>

        <form onSubmit={this.joinLobby}>
          <h1>main lobby</h1>

          <div>
            <strong>{player.name}</strong> <em>(pin: {player.id})</em>
          </div>

          <label>
            <strong>join/make game:</strong>
            <input
              autoComplete="off"
              autoCapitalize="off"
              placeholder="lobby name"
              ref={input => (this.lobbyName = input)}
              name="lobbyName"
            />
          </label>

          <button className="action">join</button>

          <button
            className="action"
            type="button"
            onClick={() => {
              setPlayer(null)
              window.location.reload()
            }}>
            logout
          </button>
        </form>

        <Previews user={player} previews={previews} />
      </div>
    )
  }
}
