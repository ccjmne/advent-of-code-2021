import solution from 'src/solution-module'
import { max, sum } from 'src/tsutils'

export default solution({
  parse(data: string) {
    return data
      .trim()
      .split(/\n/g)
      .map(line => ({
        id: Number(line.match(/^Game (\d+)/)![1]),
        r: max([...line.matchAll(/(\d+) red/g)].map(match => Number(match[1]))) ?? 0,
        g: max([...line.matchAll(/(\d+) green/g)].map(match => Number(match[1]))) ?? 0,
        b: max([...line.matchAll(/(\d+) blue/g)].map(match => Number(match[1]))) ?? 0,
      }))
  },

  partI(input): number {
    return sum(input.filter(({ r, g, b }) => r <= 12 && g <= 13 && b <= 14), ({ id }) => id)
  },

  partII(input): number {
    return sum(input.map(({ r, g, b }) => r * g * b))
  },
})
