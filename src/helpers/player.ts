import { PlayerLobby } from 'interfaces'

export function isPlayer(one: PlayerLobby): ((two: PlayerLobby) => boolean)
export function isPlayer(one: PlayerLobby, two: PlayerLobby): boolean
export function isPlayer(one: PlayerLobby, two?: PlayerLobby) {
  return two
    ? one.id === two.id && one.name === two.name
    : (two: PlayerLobby) => one.id === two.id && one.name === two.name
}
