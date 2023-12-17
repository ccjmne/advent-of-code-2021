import solution from 'src/solution-module'

function eq(a: string[], b: string[]): boolean {
  return a.every((v, i) => v === b[b.length - i - 1])
}

function diffstr(a: string, b: string): number {
  return a.split('').reduce((sum, n, i) => sum + +(n !== b[i]), 0)
}

function diff(a: string[], b: string[]): number {
  return a.reduce((sum, n, i) => sum + diffstr(n, b[b.length - i - 1]), 0)
}

function clean(strips: string[]): number {
  return strips.findIndex((_, i) => i > 0 && eq(strips.slice(Math.max(0, 2 * i - strips.length), i), strips.slice(i, 2 * i)))
}

function smudgy(strips: string[]): number {
  return strips.findIndex((_, i) => 1 === diff(strips.slice(Math.max(0, 2 * i - strips.length), i), strips.slice(i, 2 * i)))
}

export default solution({
  parse(data: string) {
    return data
      .trim()
      .split(/\n\n/g)
      .map(pattern => pattern.split(/\n/g))
      .map(rows => ({ rows, cols: Array.from(rows[0]).map((_, i) => rows.map(row => row[i]).join('')) }))
  },

  partI(input) { // start: 18:19, stop: 18:45
    return input
      .map(({ rows, cols }) => [clean(rows), clean(cols)])
      .map(([rows, cols]) => (~rows ? rows * 100 : cols))
      .reduce((sum, n) => sum + n)
  },

  partII(input) { // start: 18:45, end: 19:12
    return input
      .map(({ rows, cols }) => [smudgy(rows), smudgy(cols)])
      .map(([rows, cols]) => (~rows ? rows * 100 : cols))
      .reduce((sum, n) => sum + n)
  },
})
