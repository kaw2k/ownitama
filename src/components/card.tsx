import * as React from 'react'
import { Card as CardProps, Board } from '../interfaces'

interface Props {
  card: CardProps
  invert?: boolean
}

export const CardView: React.SFC<Props> = ({
  card: { name, moves, color },
  invert,
}) => {
  let grid: Board<'black' | 'grey'> = [
    [false, false, false, false, false],
    [false, false, false, false, false],
    [false, false, false, false, false],
    [false, false, false, false, false],
    [false, false, false, false, false],
  ]

  for (let move of moves) {
    grid[2 + move[0]][2 + move[1]] = 'grey'
  }

  grid[2][2] = 'black'

  return (
    <div className={`card  ${invert ? 'invert' : ''}`}>
      <div className="grid">
        {grid.map((row, x) => (
          <ul key={`${name}-${x}`}>
            {row.map((tile, y) => (
              <li className={tile || ''} key={`${name}-${x}-${y}`} />
            ))}
          </ul>
        ))}
      </div>

      <p>{name}</p>
    </div>
  )
}
