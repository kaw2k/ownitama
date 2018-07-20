import { Game, Coordinate, Absolute, Card } from '../interfaces'
import { translateCoordinate, equalCoordinates } from './coordinates'

export function doesCardHaveMove(
  game: Game,
  origin: Coordinate<Absolute>,
  target: Coordinate<Absolute>,
  card: Card
): boolean {
  const invertMoves = game.players[0].color === 'blue'

  for (let move of card.moves) {
    const translated = translateCoordinate(
      origin,
      invertMoves ? ([-1 * move[0], -1 * move[1]] as any) : move
    )
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
