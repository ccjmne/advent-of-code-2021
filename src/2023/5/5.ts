import { EMPTY, Subject, asapScheduler, buffer, bufferToggle, filter, from, map, observeOn, reduce, scan, skip, takeLast } from 'rxjs'

import solution from 'src/solution-module'

import { min } from 'src/tsutils'

import log from '../../../log'

type Range = [at: number, size: number]

const EMPTY_RANGE = [Infinity, 0] as Range

function intersect([a0, aSize]: Range, [b0, bSize]: Range): Range {
  const a1 = a0 + aSize
  const b1 = b0 + bSize
  const lo = Math.max(a0, b0)
  const hi = Math.min(a1, b1)
  return hi > lo ? [lo, hi - lo + 1] : EMPTY_RANGE
}

function isNotEmpty([, size]: Range): boolean {
  return size > 0
}

function difference([a0, aSize]: Range, [b0, bSize]: Range): ReadonlyArray<Range> {
  const a1 = a0 + aSize
  const b1 = b0 + bSize
  return [
    b0 > a0 ? [a0, b0 - a0] : EMPTY_RANGE,
    a1 > b1 ? [b1, a1 - b1] : EMPTY_RANGE,
  ].filter(isNotEmpty) as Range[]
}

export default solution({
  parse(data: string) {
    const input$ = new Subject<string>()
    from(data.trim().split(/\n/g)).pipe(
      skip(2),
      observeOn(asapScheduler),
    ).subscribe(input$)

    // return input$.asObservable()

    // return input$.pipe(
    //   buffer(input$.pipe(filter(line => line === ''))),
    //   map(lines => {
    //     const [header, ...m2] = lines.filter(line => line !== '')
    //     const fs = m2.map(line => {
    //       const [output, input, range] = [...line.matchAll(/\d+/g)].map(([n]) => +n)
    //       return function (n: number): number {
    //         if (n >= input && n < input + range) {
    //           return output + n - input
    //         }

    //         return -1
    //       }
    //     })

    //     return ({
    //       from: header.match(/^\w+(?=-to-)/)?.[0],
    //       to: header.match(/(?<=-to-)\w+\b/)![0],
    //       fn(n: number): number {
    //         return fs.map(f => f(n)).find(n => n !== -1) ?? n
    //       },
    //     })
    //   }),
    // )

    return input$.pipe(
      buffer(input$.pipe(filter(line => line === ''))),
      map(lines => {
        const [header, ...m2] = lines.filter(line => line !== '')
        const fs = m2.map(line => {
          const [output, input, range] = [...line.matchAll(/\d+/g)].map(([n]) => +n)
          function fn(n: number): number {
            if (n >= input && n < input + range) {
              return output + n - input
            }

            return -1
          }

          return function intersect([at, size]: Range): { domain: Range, range: Range } {
            const lo = Math.max(input, at)
            const hi = Math.min(input + range - 1, at + size - 1)
            return hi >= lo ? { domain: [lo, hi - lo + 1], range: [fn(lo), fn(hi) - fn(lo) + 1] } : { domain: [Infinity, 0], range: [Infinity, 0] }
          }
        })

        return ({
          from: header.match(/^\w+(?=-to-)/)?.[0],
          to: header.match(/(?<=-to-)\w+\b/)![0],
          fn(n: Range): Range[] {
            log(`n ${JSON.stringify(n)}`)
            const matchedRanges: Range[] = fs.map(f => f(n).range).filter(isNotEmpty)
            log(`matchedRanges ${JSON.stringify(matchedRanges)}`)
            const matchedDomains: Range[] = fs.map(f => f(n).domain).filter(isNotEmpty)
            log(`matchedDomains ${JSON.stringify(matchedDomains)}`)
            const unmatchedDomains = matchedDomains.reduce((domains, domain) => domains.flatMap(d => difference(d, domain)), [n])

            return [...matchedRanges, ...unmatchedDomains]
          },
        })
      }),
    )
  },

  partI(input) { // start 1050
    // const seeds = [2906961955, 52237479, 1600322402, 372221628, 2347782594, 164705568, 541904540, 89745770, 126821306, 192539923, 3411274151, 496169308, 919015581, 8667739, 654599767, 160781040, 3945616935, 85197451, 999146581, 344584779]
    // // const seeds = [79, 14, 55, 13]

    // input.pipe(
    //   scan((acc, { fn }) => acc.map(n => fn(n)), seeds),
    //   takeLast(1),
    //   map(s => min(s)),
    // ).subscribe(a => {
    //   log(JSON.stringify(a))
    // })
  },

  partII(input) {
    // function fnRange
    // const seeds: Range[] = [[79, 14], [55, 13]]
    // const seeds: Range[] = [[79, 14]]
    // const seeds = [[2906961955, 52237479], [1600322402, 372221628], [2347782594, 164705568], [541904540, 89745770], [126821306, 192539923], [3411274151, 496169308], [919015581, 8667739], [654599767, 160781040], [3945616935, 85197451], [999146581, 344584779]]
    // input.pipe(
    //   reduce((acc, { fn }) => acc.flatMap(r => fn(r as [number, number])), seeds),
    //   map(s => min(s, ([at]) => at)),
    // ).subscribe(a => log(JSON.stringify(a)))
  },
})
