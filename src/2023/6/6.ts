import solution from 'src/solution-module'
import { range, zip } from 'src/tsutils'

export default solution({
  parse(data) {
    return data
  },

  partI(data: string) {
    const [times, distances] = data.trim().split(/\n/g)
    return zip([...times.matchAll(/\d+/g)].map(([n]) => +n), [...distances.matchAll(/\d+/g)].map(([n]) => +n))
      .map(([time, distance]) => range(time).map(hold => hold * (time - hold)).filter(d => d > distance).length)
      .reduce((mul, n) => mul * n)
  },

  /**
   * Solve for x:
   * x * (time - x) > distance
   */
  partII(data: string) {
    const [time, distance] = data
      .trim()
      .split(/\n/g)
      .map(line => line.replace(/\s+/g, ''))
      .map(line => +line.match(/\d+/)!)
    const delta = Math.sqrt(time * time - 4 * distance)
    return Math.floor((time + delta) / 2) - Math.floor((time - delta) / 2)
  },
})
