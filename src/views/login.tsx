import * as React from 'react'
import { setPlayer } from '../helpers/localstorage'

export class Login extends React.Component {
  name: HTMLInputElement | null = null
  pin: HTMLInputElement | null = null

  onSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault()

    if (!this.name || !this.name.value.trim()) return

    setPlayer({
      name: this.name.value.trim(),
      id:
        this.pin && this.pin.value.trim()
          ? this.pin.value.trim()
          : Math.random()
              .toString()
              .slice(4, 8),
    })

    // lol
    location.reload()
  }

  render() {
    return (
      <div className="login">
        <h1>Login</h1>

        <form onSubmit={this.onSubmit}>
          <label>
            <strong>*Name:</strong>
            <input
              placeholder="name"
              autoCorrect="off"
              autoCapitalize="off"
              ref={input => (this.name = input)}
              name="login"
            />
          </label>

          <label>
            <strong>Pin:</strong>
            <input
              autoCorrect="off"
              autoComplete="off"
              autoCapitalize="off"
              placeholder="pin"
              ref={input => (this.pin = input)}
              name="pin"
            />
          </label>

          <em>
            Pin is optional. If you use the same name and pin you can resume
            games across devices.
          </em>

          <button className="action">login</button>
        </form>
      </div>
    )
  }
}
