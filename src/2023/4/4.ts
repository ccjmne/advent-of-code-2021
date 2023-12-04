import solution from 'src/solution-module'
import { range } from 'src/tsutils'

export default solution({
  parse(data: string) {
    return data
      .trim()
      .split(/\n/g)
      .map(line => ({
        winning: [...line.matchAll(/(?<=:.*)(\d+)(?=.*\|)/g)].map(match => Number(match[1])),
        numbers: [...line.matchAll(/(?<=\|.*)(\d+)/g)].map(match => Number(match[1])),
      }))
      .map(({ winning, numbers }) => numbers.filter(n => winning.includes(n)).length)
  },

  partI(input) {
    return input
      .map(matches => Math.floor(2 ** (matches - 1))) // could use `1 << (matches - 1)` instead
      .reduce((sum, n) => sum + n)
  },

  partII(input) {
    const copies: Record<number, number> = input.reduce((acc, _, idx) => ({ ...acc, [idx]: 1 }), { })
    input.forEach((matches, idx) => range(matches, { offset: idx + 1 }).forEach(i => copies[i] += copies[idx]))

    return Object.values(copies).reduce((sum, n) => sum + n)
  },

  // Could be written as follows, mutating the individual elements of the array—which is a bit dirty:

  // partII(input) {
  //   return input
  //     .map(matches => ({ matches, copies: 1 }))
  //     .map(({ matches, copies }, idx, arr) => (arr.slice(idx + 1, idx + 1 + matches).map(i => i.copies += copies), copies))
  //     .reduce((sum, n) => sum + n)
  // },
})
