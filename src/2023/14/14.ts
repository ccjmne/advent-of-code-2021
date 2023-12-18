import solution from 'src/solution-module'
import { range } from 'src/tsutils'

function clockwise(strips: string[]): string[] {
  return range(strips[0].length).map(col => strips.slice(0).reverse().map(strip => strip[col]).join(''))
}

function tilt(strips: string[]): string[] {
  return strips.map(strip => strip
    .split('#')
    .map(s => 'O'.repeat([...s.matchAll(/O/g)].length).padEnd(s.length, '.'))
    .join('#'))
}

function cycle(strips: string[]): string[] {
  return range(4).reduce(strips$ => clockwise(tilt(strips$)), strips)
}

function weigh(strips: string[]): number {
  return strips
    .map((strip, i) => [...strip.matchAll(/O/g)].length * (strips.length - i))
    .reduce((sum, n) => sum + n, 0)
}

export default solution({
  parse(data: string) {
    return data.trim().split(/\n/g)
  },

  partI(strips) { // start: 22:05, stop: 22:26
    return weigh(clockwise(tilt(clockwise(clockwise(clockwise(strips))))))
  },

  partII(strips) { // start: 22:26, stop: 23:24
    const cycles = 1_000_000_000
    const states: string[] = []
    let strips$ = clockwise(clockwise(clockwise(strips)))

    while (!states.includes(strips$.join(''))) {
      states.push(strips$.join(''))
      strips$ = cycle(strips$)
    }

    const loopStart = states.indexOf(strips$.join(''))
    const loopLength = states.length - loopStart
    return weigh(clockwise(states[loopStart + ((cycles - loopStart) % loopLength)]
      .match(new RegExp(`.{${strips$[0].length}}`, 'g'))!)) // un-join
  },
})
