import { from, map, mergeMap, reduce, takeWhile } from 'rxjs'

import { echo } from 'src/rxjs-utils'
import solution from 'src/solution-module'

export default solution({
  parse(data: string) {
    return data
      .trim()
      .split(/\n/g)
      .map(line => [...line.matchAll(/-?\d+/g)].map(Number))
  },

  partI(input) {
    return from(input).pipe(
      mergeMap(row => echo(row, row$ => row$.pipe(
        map(seq => seq.slice(1).reduce((acc, n, idx) => [...acc, n - seq[idx]], [])),
        takeWhile(seq => seq.some(n => n !== 0)),
      )).pipe(reduce((sum, seq) => sum + seq.at(-1)!, 0))),
      reduce((sum, n) => sum + n),
    )
  },

  partII(input) {
    return from(input).pipe(
      mergeMap(row => echo(row.reverse(), row$ => row$.pipe( // Merely consuming each line in reverse order does the trick!
        map(seq => seq.slice(1).reduce((acc, n, idx) => [...acc, n - seq[idx]], [])),
        takeWhile(seq => seq.some(n => n !== 0)),
      )).pipe(reduce((sum, seq) => sum + seq.at(-1)!, 0))),
      reduce((sum, n) => sum + n),
    )
  },
})
