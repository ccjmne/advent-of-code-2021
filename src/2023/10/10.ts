import { count, map, pairwise, startWith, takeWhile } from 'rxjs'

import { echo } from 'src/rxjs-utils'
import solution from 'src/solution-module'

type Pixel = 'S' | '.' | '|' | '-' | 'L' | 'J' | '7' | 'F'
type Coords = `${number},${number}`
type Tile = { at: Coords, nghbrs: Coords[] }

function nghbrs(pixel: Pixel, [x, y]: [number, number]): Coords[] {
  const possibles = {
    N: `${x},${y - 1}`,
    S: `${x},${y + 1}`,
    W: `${x - 1},${y}`,
    E: `${x + 1},${y}`,
  }

  return ({
    'S': ['N', 'S', 'W', 'E'],
    '.': [],
    '|': ['N', 'S'],
    '-': ['W', 'E'],
    'L': ['N', 'E'],
    'J': ['N', 'W'],
    '7': ['S', 'W'],
    'F': ['S', 'E'],
  }[pixel] as ('N' | 'S' | 'W' | 'E')[]).map(dir => possibles[dir] as Coords)
}

export default solution({
  parse(data: string) {
    const tiles = data
      .trim()
      .split(/\n/g)
      .flatMap((row, y) => row.split('').map((pixel, x) => ({ at: `${x},${y}`, nghbrs: nghbrs(pixel as Pixel, [x, y]) })))
      .reduce((index, tile) => Object.assign(index, { [tile.at]: tile }), {} as Record<Tile['at'], Tile>)

    const start = Object.values(tiles).find(({ nghbrs: { length } }) => length === 4)!
    start.nghbrs = start.nghbrs.filter(at => typeof tiles[at] !== 'undefined' && tiles[at].nghbrs.includes(start.at))

    return { tiles, start }
  },

  partI({ start, tiles }) {
    return echo(start, tile$ => tile$.pipe(
      startWith(null),
      pairwise(),
      map(([prev, cur]) => cur!.nghbrs.map(at => tiles[at]).find(next => next !== prev)!),
      takeWhile(tile => tile !== start),
    )).pipe(count(), map(loop => loop / 2))
  },

  partII() {
    throw new Error('Not implemented')
  },
})
