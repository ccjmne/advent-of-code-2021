import solution from 'src/solution-module'
import { split } from 'src/tsutils'
import { type RegExpWGroups } from 'src/types.d'

type Op = 'noop' | 'addx'
type Arg = number | typeof NaN

function padCycles([op, arg]: [Op, Arg]): ReadonlyArray<[Op, Arg]> {
  return [
    ...Array.from({ length: ({ addx: 1 }[op] ?? 0) }, () => ['noop', NaN] as [Op, Arg]),
    [op, arg],
  ]
}

export default solution({
  parse(data: string): ReadonlyArray<[Op, Arg]> {
    return data
      .split(/\n/g)
      .map(line => /^(?<op>noop|addx)(?: (?<arg>-?\d+))?/.exec(line) as RegExpWGroups<'op' | 'arg'>)
      .map(({ groups: { op, arg } }) => [op as Op, Number(arg)])
      .flatMap(padCycles)
  },

  partI(input: ReadonlyArray<[Op, Arg]>): number {
    return input.reduce(
      ({ X, cycle, str }, [op, arg]) => ({
        X: X + +(op === 'addx' && arg),
        cycle: cycle + 1,
        str: str + +(cycle % 40 === 20 && cycle * X),
      }),
      { X: 1, cycle: 1, str: 0 },
    ).str
  },

  partII(input: ReadonlyArray<[Op, Arg]>): string {
    const pixels: string[] = []
    input.reduce(
      ({ X, cycle }, [op, arg]) => {
        pixels.push(Math.abs(X - cycle) <= 1 ? '█' : '·')
        return ({ X: X + +(op === 'addx' && arg), cycle: ((cycle + 1) % 40) })
      },
      { X: 1, cycle: 0 },
    )

    return `\n${split(pixels, 40, row => row.join('')).join('\n')}`
  },
})
