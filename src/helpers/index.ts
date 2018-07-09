import {
  Game,
  Coordinate,
  Absolute,
  Relative,
  Card,
  Piece,
} from '../interfaces'

// ======================
// MOCK DATA
// ======================
export function clone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

function translateCoordinate(
  absolute: Coordinate<Absolute>,
  relative: Coordinate<Relative>
): Coordinate<Absolute> | null {
  const x = absolute[0] + relative[0]
  const y = absolute[1] + relative[1]

  if (x < 0 || x > 4 || y < 0 || y > 4) return null

  return [x, y] as Coordinate<Absolute>
}

export function equalCoordinates(
  coordOne: Coordinate<Absolute>,
  coordTwo: Coordinate<Absolute>
): boolean {
  return coordOne[0] === coordTwo[0] && coordOne[1] === coordTwo[1]
}

export function doesCardHaveMove(
  game: Game,
  origin: Coordinate<Absolute>,
  target: Coordinate<Absolute>,
  card: Card
): boolean {
  for (let move of card.moves) {
    const translated = translateCoordinate(origin, move)
    if (translated && equalCoordinates(translated, target)) {
      return true
    }
  }

  return false
}

export function possibleMoves(
  game: Game,
  origin: Coordinate<Absolute>
): Coordinate<Absolute>[] {
  const activePlayer = game.players[0]

  // If we are blue, the board is inverted so invert our moves
  const invertMoves = activePlayer.color === 'blue'

  let possibleCoordinates: Coordinate<Absolute>[] = []

  for (let card of activePlayer.cards) {
    for (let move of card.moves) {
      const translated = translateCoordinate(
        origin,
        !invertMoves ? move : ([-1 * move[0], -1 * move[1]] as any)
      )
      const piece = translated && game.board[translated[0]][translated[1]]

      // a move is valid if it is on the board and not on a piece of your color
      if (translated && (!piece || piece.color !== activePlayer.color)) {
        possibleCoordinates.push(translated)
      }
    }
  }

  return possibleCoordinates
}

export function winningPlayer(game: Game): false | 'red' | 'blue' {
  // Red has touched blue's stairs
  const blueStairs = game.board[0][2]
  if (blueStairs && blueStairs.color === 'red') return 'red'

  // Blue has touched red's stairs
  const redStairs = game.board[4][2]
  if (redStairs && redStairs.color === 'blue') return 'blue'

  const kings = [
    ...game.board[0],
    ...game.board[1],
    ...game.board[2],
    ...game.board[3],
    ...game.board[4],
  ].filter(
    piece => typeof piece === 'object' && piece.type === 'master'
  ) as Piece[]

  // Blue has killed red's king
  if (kings.length === 1 && kings[0].color === 'blue') return 'blue'

  // Red has killed blue's king
  if (kings.length === 1 && kings[0].color === 'red') return 'red'

  return false
}

export function shuffle<T extends any[]>(things: T): T {
  let array = things.slice()
  let counter = array.length

  // While there are elements in the array
  while (counter > 0) {
    // Pick a random index
    let index = Math.floor(Math.random() * counter)

    // Decrease counter by 1
    counter--

    // And swap the last element with it
    let temp = array[counter]
    array[counter] = array[index]
    array[index] = temp
  }

  return array as any
}
