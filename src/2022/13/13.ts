import solution from 'src/solution-module'
import { range, sum } from 'src/tsutils'

type Packet = number | Packet[]

function compare(left: Packet, right: Packet): number {
  if (typeof left === 'number' && typeof right === 'number') {
    return left - right
  }

  if (Array.isArray(left) && Array.isArray(right)) {
    return range(Math.min(left.length, right.length))
      .map(i => compare(left[i], right[i]))
      .find(diff => !!diff) ?? left.length - right.length
  }

  return compare([left].flat(), [right].flat())
}

export default solution({
  parse(data: string): [Packet, Packet][] {
    return data
      .split(/\n^$\n/gm)
      .map(pair => pair.split(/\n/).map(line => JSON.parse(line)) as [Packet, Packet])
  },

  partI(input: [Packet, Packet][]): number {
    return sum(input.map(([left, right], i) => (compare(left, right) < 0 ? i + 1 : 0)))
  },

  partII(input: [Packet, Packet][]): number {
    const sorted = [...input.flat(), 2, 6].sort(compare)
    return (sorted.findIndex(p => !compare(p, 2)) + 1) * (sorted.findIndex(p => !compare(p, 6)) + 1)
  },
})
