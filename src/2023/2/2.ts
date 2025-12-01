import solution from 'src/solution-module'
import { max, sum } from 'src/tsutils'

export default solution({
  parse(data: string) {
    return data.trim().split(/\n/g).map(line => ({
      id: Number(line.match(/^Game (\d+)/)![1]),
      r: max(line.match(/(\d+) red/g)  !.map(Number)) ?? 0,
      g: max(line.match(/(\d+) green/g)!.map(Number)) ?? 0,
      b: max(line.match(/(\d+) blue/g) !.map(Number)) ?? 0,
    }))
  },

  partI(input): number {
    return sum(input.filter(({ r, g, b }) => r <= 12 && g <= 13 && b <= 14), ({ id }) => id)
  },

  partII(input): number {
    return sum(input.map(({ r, g, b }) => r * g * b))
  },
})
