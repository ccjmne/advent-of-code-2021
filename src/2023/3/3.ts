import { bufferCount, endWith, filter, firstValueFrom, from, map, mergeMap, reduce, skipLast, startWith, type Observable } from 'rxjs'

import solution from 'src/solution-module'

function overlaps([a0, a1], [b0, b1]): boolean {
  return (b0 >= a0 && b0 <= a1) || (b1 >= a0 && b1 <= a1)
}

function touches(a: RegExpMatchArray, b: RegExpMatchArray): boolean {
  return overlaps([a.index! - 1, a.index! + a[0].length], [b.index!, b.index! + b[0].length - 1])
}

type Row = { numbers: RegExpMatchArray[], symbols: RegExpMatchArray[] }

export default solution({
  parse(data: string): Observable<[Row, Row, Row]> {
    return from(data.trim().split(/\n/g)).pipe(
      startWith(''),
      endWith(''),
      map(row => ({ numbers: [...row.matchAll(/\d+/g)], symbols: [...row.matchAll(/[^.\d]/g)] })),
      bufferCount(3, 1),
      skipLast(2), // skip incomplete buffers at the end
    ) as Observable<[Row, Row, Row]>
  },

  partI(input) {
    return firstValueFrom(input.pipe(
      map(([pre, cur, post]) => [cur.numbers, [pre, cur, post].flatMap(({ symbols }) => symbols)]),
      mergeMap(([numbers, symbols]) => numbers.filter(num => symbols.some(sym => touches(num, sym)))),
      reduce((sum, next) => sum + Number(next), 0),
    ))
  },

  partII(input) {
    return firstValueFrom(input.pipe(
      map(([pre, cur, post]) => [cur.symbols.filter(sym => sym[0] === '*'), [pre, cur, post].flatMap(({ numbers }) => numbers)]),
      mergeMap(([gears, numbers]) => gears.map(sym => numbers.filter(num => touches(sym, num)))),
      filter(({ length }) => length === 2),
      map(([a, b]) => Number(a) * Number(b)),
      reduce((sum, next) => sum + next),
    ))
  },
})
