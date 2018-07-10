import * as React from 'react'
import { Chat as ChatType } from '../interfaces'

interface Props {
  onSubmit: (message: string) => void
  chats: ChatType
}

interface State {
  message: string
}

export class Chat extends React.Component<Props, State> {
  state: State = { message: '' }

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
        <form onSubmit={this.onSubmit}>
          <label>
            <strong>Chat: </strong>
            <input
              placeholder="message"
              value={this.state.message}
              onChange={this.onChange}
            />
          </label>
        </form>

        {chats && (
          <ul>
            {chats.map(({ playerName, message }, i) => (
              <li key={`${playerName}-${i}`}>
                <strong>{playerName}:</strong>
                {message}
              </li>
            ))}
          </ul>
        )}
      </div>
    )
  }
}
