import { PlayerLobby } from 'interfaces'

export const isPlayer = (one: PlayerLobby, two: PlayerLobby) =>
  one.id === two.id && one.name === two.name
