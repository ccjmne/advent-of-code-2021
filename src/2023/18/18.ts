import solution from 'src/solution-module'
import { range, rangeBounds } from 'src/tsutils'
import log from 'tools/log'

export default solution({
  parse(data: string) {
    return data

    // return data
    //   .trim()
    //   .split(/\n/g)
    //   .map(line => line.split(' '))
    //   .map(([dir, len, colour]) => ({ dir, len: Number(len), colour }))
  },

  partI(data) { // start: 19:46, stop: 20:43
    const input = data
      .trim()
      .split(/\n/g)
      .map(line => line.split(' '))
      .map(([dir, len, colour]) => ({ dir, len: Number(len), colour }))

    const bounds = input.reduce(({ bounds: b, cur }, { dir, len }) => {
      const next = ({
        U: [cur[0], cur[1] - len],
        D: [cur[0], cur[1] + len],
        L: [cur[0] - len, cur[1]],
        R: [cur[0] + len, cur[1]],
      })[dir]!

      return ({
        bounds: {
          N: Math.min(b.N, next[1]),
          S: Math.max(b.S, next[1]),
          W: Math.min(b.W, next[0]),
          E: Math.max(b.E, next[0]),
        },
        cur: next,
      })
    }, { bounds: { N: 0, E: 0, S: 0, W: 0 }, cur: [0, 0] })

    const canvas = range(Math.abs(bounds.bounds.N - bounds.bounds.S) + 1).map(y => range(Math.abs(bounds.bounds.E - bounds.bounds.W) + 1).map(x => '.'))
    // return bounds

    // return canvas.map(line => line.join('')).join('\n')

    function canvasCoords(x: number, y: number): [number, number] {
      return [x - bounds.bounds.W, y - bounds.bounds.N]
    }

    function v(x: number, y0: number, y1: number): void {
      rangeBounds(y0, y1).forEach(y => {
        const [x$, y$] = canvasCoords(x, y)
        canvas[y$][x$] = '#'
      })
    }

    function h(y: number, x0: number, x1: number): void {
      rangeBounds(x0, x1).forEach(x => {
        const [x$, y$] = canvasCoords(x, y)
        canvas[y$][x$] = '#'
      })
    }

    // return bounds

    input.reduce(([x, y], { dir, len }) => {
      const next = ({
        U: [x, y - len],
        D: [x, y + len],
        L: [x - len, y],
        R: [x + len, y],
      })[dir]!

      if (dir === 'U' || dir === 'D') {
        v(x, y, next[1])
      }

      if (dir === 'L' || dir === 'R') {
        h(y, x, next[0])
      }

      return next as [number, number]
    }, [0, 0] as [number, number])
    // return sum

    const cc = [['.', ...canvas[0].map(() => '.'), '.'], ...canvas.map(line => ['.', ...line, '.']), ['.', ...canvas[0].map(() => '.'), '.']]

    const next = [[0, 0]] as [number, number][]

    (function flood() {
      while (next.length) {
        const [x, y] = next.shift()!

        if (0 <= x && x < cc[0].length && 0 <= y && y < cc.length) {
          if (cc[y][x] === '.') {
            cc[y][x] = 'O'
            next.push([x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1])
          }
        }
      }
    }())

    return cc.reduce((ssum, line) => ssum + line.reduce((sum, c) => sum + (c !== 'O' ? 1 : 0), 0), 0)

    return cc.map(line => line.join('')).join('\n')
  },

  partII(data) {
    const input = data
      .trim()
      .split(/\n/g)
      .map(line => line.split(' '))
      .map(([,,colour]) => {
        log(colour)

        return ({
          dir: {
            3: 'U',
            1: 'D',
            2: 'L',
            0: 'R',
          }[colour.match(/\w(?!\w)/)![0]]!,
          len: parseInt(colour.match(/\w{5}/)![0], 16),
          colour,
        })
      })

    return input

    const bounds = input.reduce(({ bounds: b, cur }, { dir, len }) => {
      const next = ({
        U: [cur[0], cur[1] - len],
        D: [cur[0], cur[1] + len],
        L: [cur[0] - len, cur[1]],
        R: [cur[0] + len, cur[1]],
      })[dir]!

      return ({
        bounds: {
          N: Math.min(b.N, next[1]),
          S: Math.max(b.S, next[1]),
          W: Math.min(b.W, next[0]),
          E: Math.max(b.E, next[0]),
        },
        cur: next,
      })
    }, { bounds: { N: 0, E: 0, S: 0, W: 0 }, cur: [0, 0] })

    const canvas = range(Math.abs(bounds.bounds.N - bounds.bounds.S) + 1).map(y => range(Math.abs(bounds.bounds.E - bounds.bounds.W) + 1).map(x => '.'))
    // return bounds

    // return canvas.map(line => line.join('')).join('\n')

    function canvasCoords(x: number, y: number): [number, number] {
      return [x - bounds.bounds.W, y - bounds.bounds.N]
    }

    function v(x: number, y0: number, y1: number): void {
      rangeBounds(y0, y1).forEach(y => {
        const [x$, y$] = canvasCoords(x, y)
        canvas[y$][x$] = '#'
      })
    }

    function h(y: number, x0: number, x1: number): void {
      rangeBounds(x0, x1).forEach(x => {
        const [x$, y$] = canvasCoords(x, y)
        canvas[y$][x$] = '#'
      })
    }

    // return bounds

    input.reduce(([x, y], { dir, len }) => {
      const next = ({
        U: [x, y - len],
        D: [x, y + len],
        L: [x - len, y],
        R: [x + len, y],
      })[dir]!

      if (dir === 'U' || dir === 'D') {
        v(x, y, next[1])
      }

      if (dir === 'L' || dir === 'R') {
        h(y, x, next[0])
      }

      return next as [number, number]
    }, [0, 0] as [number, number])
    // return sum

    const cc = [['.', ...canvas[0].map(() => '.'), '.'], ...canvas.map(line => ['.', ...line, '.']), ['.', ...canvas[0].map(() => '.'), '.']]

    const next = [[0, 0]] as [number, number][]

    (function flood() {
      while (next.length) {
        const [x, y] = next.shift()!

        if (0 <= x && x < cc[0].length && 0 <= y && y < cc.length) {
          if (cc[y][x] === '.') {
            cc[y][x] = 'O'
            next.push([x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1])
          }
        }
      }
    }())

    return cc.map(line => line.join('')).join('\n')

    return cc.reduce((ssum, line) => ssum + line.reduce((sum, c) => sum + (c !== 'O' ? 1 : 0), 0), 0)
  },
})
