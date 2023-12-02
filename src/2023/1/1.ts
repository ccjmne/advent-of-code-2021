import solution from 'src/solution-module'
import { sum } from 'src/tsutils'

const map: Record<string, string> = { one: '1', two: '2', three: '3', four: '4', five: '5', six: '6', seven: '7', eight: '8', nine: '9' }

export default solution({
  parse(data: string) {
    return data.split(/\n/g)
  },

  partI(input: string[]): number {
    return sum(input
      .map(line => line.match(/^[^\d]*(\d)/)![1] + line.match(/(\d)[^\d]*$/)![1])
      .map(Number))
  },

  partII(input: string[]): number {
    return sum(input
      // do two passes, in order to recognise both the `one` and the `eight` in entries like `oneight`
      .map(line => line.replace(/one|two|three|four|five|six|seven|eight|nine/g, match => map[match] + match.slice(1)))
      .map(line => line.replace(/one|two|three|four|five|six|seven|eight|nine/g, match => map[match] + match.slice(1)))
      .map(line => line.match(/^[^\d]*(\d)/)![1] + line.match(/(\d)[^\d]*$/)![1])
      .map(Number))
  },
})
