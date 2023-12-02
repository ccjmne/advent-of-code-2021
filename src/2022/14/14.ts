import solution from 'src/solution-module'
import { pairs, rangeBounds as fromTo } from 'src/tsutils'
import { RegExpWGroups } from 'src/types.d'

type Tile = { x: number, y: number }
function serialise({ x, y }: Tile): `${number},${number}` {
  return `${x},${y}`
}

export default solution({
  parse(data: string): { rock: Set<`${number},${number}`>, bottom: number } {
    return {
      rock: new Set(data
        .split(/\n/g)
        .map(line => ([...line.matchAll(/(?<x>\d+),(?<y>\d+)/g)] as RegExpWGroups<'x' | 'y'>[]).map(({ groups }) => groups))
        .map(points => pairs(points.map(({ x, y }) => ({ x: Number(x), y: Number(y) }))))
        .reduce(
          (rock, walls) => [
            ...rock,
            ...walls.flatMap(([{ x: x0, y: y0 }, { x: x1, y: y1 }]) => fromTo(x0, x1).flatMap(x => fromTo(y0, y1).map(y => ({ x, y })))),
          ],
          [],
        )
        .map(serialise)),
      bottom: Math.max(...data.match(/(?<=,)\d+/g)!.map(Number)),
    }
  },

  partI({ rock, bottom }: { rock: Set<`${number},${number}`>, bottom: number }): number {
    const sand = new Set<`${number},${number}`>()
    function fall({ x, y }: Tile): Tile {
      if (y >= bottom) {
        return { x, y: Infinity }
      }

      const next = [0, -1, 1]
        .map(Δx => ({ x: x + Δx, y: y + 1 }))
        .find(({ x: xx, y: yy }) => !rock.has(`${xx},${yy}`) && !sand.has(`${xx},${yy}`))

      return next ? fall(next) : { x, y }
    }

    let where: Tile
    do {
      sand.add(serialise(where = fall({ x: 500, y: 0 })))
    } while (where.y !== Infinity)

    return sand.size - 1
  },

  partII({ rock, bottom }: { rock: Set<`${number},${number}`>, bottom: number }): number {
    const sand = new Set<`${number},${number}`>()
    function fall({ x, y }: Tile): Tile {
      if (y > bottom) {
        return { x, y }
      }

      const next = [0, -1, 1]
        .map(Δx => ({ x: x + Δx, y: y + 1 }))
        .find(({ x: xx, y: yy }) => !rock.has(`${xx},${yy}`) && !sand.has(`${xx},${yy}`))

      return next ? fall(next) : { x, y }
    }

    let where: Tile
    do {
      sand.add(serialise(where = fall({ x: 500, y: 0 })))
    } while (where.x !== 500 || where.y !== 0)

    return sand.size
  },
})
