import * as React from 'react'
import { Chat as ChatType, FirebaseUserState, PlayerLobby } from '../interfaces'
import { PlayerName } from './player'
import {
  setNotificationSettings,
  getNotificationSettings,
} from '../helpers/localstorage'
import { notifyChat } from '../helpers/notify'
import './chat.scss'

interface Props {
  player: PlayerLobby
  onSubmit: (message: string) => void
  chats: ChatType
  userPresence: FirebaseUserState
}

interface State {
  message: string
  notifyChat?: boolean
}

export class Chat extends React.Component<Props, State> {
  state: State = { message: '', notifyChat: getNotificationSettings().chat }

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (
      this.state.notifyChat &&
      (this.props.chats || []).length !== (prevProps.chats || []).length &&
      this.props.chats &&
      this.props.chats[0] &&
      this.props.chats[0].id !== this.props.player.id
    ) {
      notifyChat(this.props.chats![0])
    }
  }

  onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    this.setState({ message: '' })
    if (this.state.message.trim().length)
      this.props.onSubmit(this.state.message.trim())
  }

  onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ message: e.target.value })
  }

  render() {
    const { chats } = this.props

    return (
      <div className="chat">
        <label>
          <input
            className="notify"
            type="checkbox"
            checked={this.state.notifyChat}
            onChange={event => {
              setNotificationSettings({ chat: true })
              this.setState({ notifyChat: event.target.checked })
            }}
          />{' '}
          Notify on Chat
        </label>

        <form onSubmit={this.onSubmit}>
          <label>
            <strong>Chat: </strong>
            <input
              className="message"
              placeholder="message"
              value={this.state.message}
              onChange={this.onChange}
            />
          </label>
        </form>

        {chats && (
          <ul>
            {chats.map(({ playerName, message, id }, i) => (
              <li key={`${playerName}-${i}`}>
                {/* <strong>{playerName}:</strong> */}
                <PlayerName
                  inline
                  player={{ name: playerName, id }}
                  statuses={this.props.userPresence}
                />: {message}
              </li>
            ))}
          </ul>
        )}
      </div>
    )
  }
}
