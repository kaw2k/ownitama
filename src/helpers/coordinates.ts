import { Coordinate, Absolute, Relative } from '../interfaces'

export function translateCoordinate(
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
