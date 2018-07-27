import { Game, Piece } from '../interfaces'

export function isGameOver(game: Game): false | 'red' | 'blue' {
  // Red has touched blue's stairs
  const blueStairs = game.board[0][2]
  if (blueStairs && blueStairs.color === 'red' && blueStairs.type === 'master')
    return 'red'

  // Blue has touched red's stairs
  const redStairs = game.board[4][2]
  if (redStairs && redStairs.color === 'blue' && redStairs.type === 'master')
    return 'blue'

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
