import { count, map, pairwise, startWith, takeWhile, toArray } from 'rxjs'

import { echo } from 'src/rxjs-utils'
import solution from 'src/solution-module'

type Coords = `${number},${number}`
type Tile = { at: Coords, pixel: string, nghbrs: Coords[] }

function neighbours(pixel: string, [x, y]: [number, number]): Coords[] {
  const candidates = {
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
  }[pixel] as ('N' | 'S' | 'W' | 'E')[]).map(dir => candidates[dir] as Coords)
}

function patchStart({ at, nghbrs }: Tile, tiles: Map<Coords, Tile>): Tile {
  const [x, y] = at.split(',').map(Number)
  const actual = nghbrs.filter(n => tiles.get(n)?.nghbrs.includes(at))
  return {
    at,
    nghbrs: actual,
    pixel: [
      [new Set([`${x},${y + 1}`, `${x},${y - 1}`]), '|'] as const,
      [new Set([`${x + 1},${y}`, `${x - 1},${y}`]), '-'] as const,
      [new Set([`${x + 1},${y}`, `${x},${y - 1}`]), 'L'] as const,
      [new Set([`${x - 1},${y}`, `${x},${y - 1}`]), 'J'] as const,
      [new Set([`${x - 1},${y}`, `${x},${y + 1}`]), '7'] as const,
      [new Set([`${x + 1},${y}`, `${x},${y + 1}`]), 'F'] as const,
    ].find(([set]) => actual.every(nghbr => set.has(nghbr)))![1],
  }
}

export default solution({
  parse(data: string) {
    const rows = data.trim().split(/\n/g)
    const tiles = rows
      .flatMap((row, y) => row.split('').map((pixel, x) => ({ at: `${x},${y}` as const, pixel, nghbrs: neighbours(pixel, [x, y]) })))
      .reduce((index, tile) => index.set(tile.at, tile), new Map<Coords, Tile>())
    const start = patchStart([...tiles.values()].find(({ nghbrs: { length } }) => length === 4)!, tiles)

    return { tiles: tiles.set(start.at, start), start, w: rows[0].length, h: rows.length }
  },

  partI({ tiles, start }) {
    return echo(start, tile$ => tile$.pipe(
      startWith(null),
      pairwise(),
      map(([prev, cur]) => cur!.nghbrs.map(at => tiles.get(at)).find(next => next !== prev)!),
      takeWhile(tile => tile !== start),
    )).pipe(count(), map(loop => loop / 2))
  },

  partII({ tiles, start, w, h }) {
    return echo(start, tile$ => tile$.pipe(
      startWith(null),
      pairwise(),
      map(([prev, cur]) => cur!.nghbrs.map(at => tiles.get(at)).find(next => next !== prev)!),
      takeWhile(tile => tile !== start),
    )).pipe(
      toArray(),
      map(loop => loop.reduce((index, { at, pixel }) => index.set(at, pixel), new Map<Coords, string>())),
      /**
       * Scan horizontally and discriminate between inside and outside using parity.
       *
       * The trick is to realise that the parity switches on only the following cases:
       * - a single ┃
       * - a ┏┛ pair, possibly interspaced with a continous line of ━
       * - a ┗┓ pair, possibly interspaced with a continous line of ━
       *
       * What is of importance to note is that the ┏┓ and ┗┛ pairs do not switch parity—or rather, they switch it twice, to no effect.
       *
       * Because a leftmost loop tile must be one of ┃, ┏, or ┗, and the latter two must be terminated by either a ┛ or ┓,
       * we know that we may only encouter (outside of the obvious ┃) the following 4 patterns: ┗┓, ┏┛, ┏┓, and ┗┛.
       *
       * Each of these patterns is made of a pair, which will systematically present, on the W–E axis, both
       * Westward and Eastward connections (linking the two together), but may, on the N–S axis,
       * present either Northward and Southward connections OR two connections to the same direction.
       *
       * Arbitrarily picking a direction on the N–S axis and switching parity when encountering any piece connecting there
       * allows us to handle all 4 cases with the same logic.
       *
       * Below, I picked the Northward direction, and will switch parity on either of ┃, ┛, or ┗, thus explaining the /[J|L]/ regex.
      */
      map(loop => Array.from({ length: h }, (_, y) => Array.from({ length: w }, (_, x) => x).reduce(
        ([sum, inside], x) => (loop.has(`${x},${y}`)
          ? [sum, inside !== /[J|L]/.test(loop.get(`${x},${y}`)!)] as const
          : [sum + +inside, inside] as const),
        [0, false] as const,
      )).reduce((sum, [row]) => sum + row, 0)),
    )
  },
})
