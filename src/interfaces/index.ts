export type Absolute = 0 | 1 | 2 | 3 | 4
export type Relative = -2 | -1 | 0 | 1 | 2 // negative is up and left
export type Coordinate<T> = [T, T]

type Color = 'red' | 'blue'

export interface Piece {
  type: 'student' | 'master'
  color: Color
}

type Tile<T> = T | false
type Row<T> = [Tile<T>, Tile<T>, Tile<T>, Tile<T>, Tile<T>]
export type Board<T> = [Row<T>, Row<T>, Row<T>, Row<T>, Row<T>]

export interface Card {
  name: string
  moves: Coordinate<Relative>[]
  movesInverted: Coordinate<Relative>[]
  color: Color
}

export interface PlayerLobby {
  name: string
  id: string
}

export interface PlayerGame extends PlayerLobby {
  color: Color
  cards: [Card, Card]
}

export interface Game {
  board: Board<Piece>
  players: [PlayerGame, PlayerGame] // First player is active player
  card: Card // The extra card
  lastMove: {
    origin: Coordinate<Absolute>
    target: Coordinate<Absolute>
  } | null
}

type Chat = { playerName: string; message: string }[] | null

export interface LobbyState {
  type: 'lobby'
  cards:
    | null
    | [Card]
    | [Card, Card]
    | [Card, Card, Card]
    | [Card, Card, Card, Card]
    | [Card, Card, Card, Card, Card]
  players: null | [PlayerLobby] | [PlayerLobby, PlayerLobby]
  chat: Chat
}

export const LobbyStateDefault: LobbyState = {
  type: 'lobby',
  chat: null,
  cards: null,
  players: null,
}

export interface GameState {
  type: 'game'
  game: Game[]
  chat: Chat
}

export interface LoadingState {
  type: 'loading'
}

export interface MainLobby {
  type: 'main-lobby'
}

export type FirebaseState = LoadingState | GameState | LobbyState | MainLobby

export type LocalStorageState = PlayerLobby

export interface LobbyLocalState {
  message: string
}
