export type Absolute = 0 | 1 | 2 | 3 | 4
export type Relative = -2 | -1 | 0 | 1 | 2 // negative is up and left
export type Coordinate<T> = [T, T]

type Color = 'red' | 'blue'
type Type = 'student' | 'master'

export interface Piece<T extends Type, C extends Color> {
  type: T
  color: C
  location: Coordinate<Absolute> | null
}

// type Tile<T> = T | false
// type Row<T> = [Tile<T>, Tile<T>, Tile<T>, Tile<T>, Tile<T>]
// export type Board<T> = [Row<T>, Row<T>, Row<T>, Row<T>, Row<T>]

export interface Board {
  pieces: [
    Piece<'student', 'red'>,
    Piece<'student', 'red'>,
    Piece<'student', 'red'>,
    Piece<'student', 'red'>,
    Piece<'master', 'red'>,

    Piece<'student', 'blue'>,
    Piece<'student', 'blue'>,
    Piece<'student', 'blue'>,
    Piece<'student', 'blue'>,
    Piece<'master', 'blue'>
  ]
}

export interface Card {
  name: string
  moves: Coordinate<Relative>[]
  color: Color
  // orientation / inverse
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
  board: Board
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

export type FirebaseState = LoadingState | GameState | LobbyState

export type LocalStorageState = PlayerLobby

export interface LobbyLocalState {
  message: string
}

export interface GameLocalState {
  message: string
  origin: Coordinate<Absolute> | null
}

// ==============================
// Actions
// ==============================
export function makeMove(
  game: Game,
  piece: Piece,
  target: Coordinate<Absolute>,
  card?: Card
): Game | 'specify-card' | 'error' {
  let nextGame = clone(game)

  // Error if we are moving a piece we shouldn't be
  const newPiece = Object.assign({}, piece);
  if (!newPiece || newPiece.color !== game.players[0].color) return 'error'

  // Find all our possible moves, we will use this to see if it is valid
  // or needs more information from the player
  const possibleMoveOptions = possibleMoves(nextGame, newPiece.location).filter(c =>
    equalCoordinates(c, target)
  )

  // Error if we are moving a piece to where it shouldn't be
  if (possibleMoveOptions.length === 0) return 'error'

  // If there are multiple cards that get us to our target
  if (possibleMoveOptions.length > 1 && !card) return 'specify-card'

  // Swap the card that was used for the next card
  // this seems like a weird way to do this
  if (
    doesCardHaveMove(nextGame, newPiece.location, target, nextGame.players[0].cards[0])
  ) {
    nextGame.card = game.players[0].cards[0]
    nextGame.players[0].cards[0] = game.card
  } else {
    nextGame.card = game.players[0].cards[1]
    nextGame.players[0].cards[1] = game.card
  }

  nextGame.lastMove = { newPiece.location, target }

  // Move the piece
  newPiece.location[0]
  nextGame.board[newPiece.location[0]][newPiece.location[1]] = false

  // Rotate the players
  nextGame.players = [nextGame.players[1], nextGame.players[0]]

  return nextGame
}
