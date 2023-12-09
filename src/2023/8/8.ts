import { count, filter, from, map, mergeMap, reduce, takeWhile } from 'rxjs'

import { echo } from 'src/rxjs-utils'
import solution from 'src/solution-module'

type Node = { id: string, L: string, R: string }

export default solution({
  parse(data: string) {
    const [instructions,, ...paths] = data.trim().split(/\n/g)

    return {
      instructions,
      nodes: paths
        .map(line => ({ id: line.match(/^[\w]{3}/)![0], L: line.match(/\(([\w]{3})/)![1], R: line.match(/([\w]{3})\)/)![1] }))
        .reduce((nodes, node) => ({ ...nodes, [node.id]: node }), {} as Record<string, Node>),
    }
  },

  partI({ instructions, nodes }) {
    return echo(nodes.AAA, node$ => node$.pipe(
      map((node, i) => nodes[node[instructions.at(i % instructions.length) as 'L' | 'R']]),
      takeWhile(node => node !== nodes.ZZZ),
    )).pipe(count())
  },

  partII({ instructions, nodes }) {
    function gcd(a: number, b: number): number {
      return b === 0 ? a : gcd(b, a % b)
    }

    function lcm(a: number, b: number): number {
      return (a * b) / gcd(a, b)
    }

    return from(Object.entries(nodes)).pipe(
      filter(([id]) => id.endsWith('A')),
      mergeMap(([, A]) => echo(A, node$ => node$.pipe(
        map((node, i) => nodes[node[instructions.at(i % instructions.length) as 'L' | 'R']]),
        takeWhile(({ id }) => !id.endsWith('Z')),
      )).pipe(count())),
      reduce(lcm),
    )
  },
})
