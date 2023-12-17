import solution from 'src/solution-module'
import { memoize, range, sum } from 'src/tsutils'

const arrangements = memoize((springs: string, groups: number[]): number => {
  if (springs.length < sum(groups) + groups.length - 1) {
    return 0
  }

  if (!springs.length) {
    return +!groups.length
  }

  if (!groups.length) {
    return +!springs.includes('#')
  }

  if (springs.startsWith('.')) {
    return arrangements(springs.replace(/^\.+/, ''), groups)
  }

  if (springs.startsWith('?')) {
    return arrangements(springs.replace(/^./, '#'), groups) + arrangements(springs.replace(/^./, '.'), groups)
  }

  const [group, ...rest] = groups
  return new RegExp(`^[#?]{${group}}(?!#)`).test(springs)
    ? arrangements(springs.slice(group + 1), rest)
    : 0
})

export default solution({
  parse(data: string) {
    return data
      .trim()
      .split(/\n/g)
      .map(line => line.split(' '))
      .map(([springs, groups]) => ({ springs, groups: groups.split(',').map(Number) }))
  },

  partI(input) {
    return sum(input.map(({ springs, groups }) => arrangements(springs, groups)))
  },

  partII(input) {
    return sum(input.map(({ springs, groups }) => arrangements(
      range(5).map(() => springs).join('?'),
      range(5).map(() => groups).flat(),
    )))
  },
})
