import solution from 'src/solution-module'
import { sum } from 'src/tsutils'

const digits: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9 }

export default solution({
  parse(data: string) {
    return data.trim().split(/\n/g)
  },

  partI(input: string[]): number {
    return sum(input
      .map(line => line.match(/^[^\d]*(\d)/)![1] + line.match(/(\d)[^\d]*$/)![1])
      .map(Number))
  },

  partII(input: string[]): number {
    return sum(input
      .map( // Use a lookahead to match overlapping patterns, like `eightwoneight`, which should become `8218`
        line => [...line.matchAll(/(?=(one|two|three|four|five|six|seven|eight|nine|\d))/g)]
          .map(([, found]) => found)
          .map(found => digits[found] ?? found)
          .join(''),
      )
      .map(line => line[0] + line.at(-1))
      .map(Number))
  },
})
