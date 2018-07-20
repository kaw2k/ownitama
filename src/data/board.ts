import { Board, Piece } from 'interfaces'

export const InitialBoard: Board<Piece> = [
  [
    { color: 'blue', type: 'student' },
    { color: 'blue', type: 'student' },
    { color: 'blue', type: 'master' },
    { color: 'blue', type: 'student' },
    { color: 'blue', type: 'student' },
  ],
  [false, false, false, false, false],
  [false, false, false, false, false],
  [false, false, false, false, false],
  [
    { color: 'red', type: 'student' },
    { color: 'red', type: 'student' },
    { color: 'red', type: 'master' },
    { color: 'red', type: 'student' },
    { color: 'red', type: 'student' },
  ],
]
