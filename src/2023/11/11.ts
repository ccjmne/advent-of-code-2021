import solution from 'src/solution-module'
import { range } from 'src/tsutils'

export default solution({
  parse(data: string) {
    const grid = data.trim().split(/\n/g).map(line => line.split(''))
    const galaxies = grid.flatMap((line, y) => line.flatMap((pixel, x) => (pixel === '#' ? [[x, y] as const] : [])))
    return {
      galaxies,
      voidX: range(grid[0].length).filter(x => !galaxies.some(([xx]) => xx === x)),
      voidY: range(grid.length).filter(y => !galaxies.some(([, yy]) => yy === y)),
    }
  },

  partI({ galaxies, voidX, voidY }) { // start 22:10, stop 22:20
    return galaxies
      .flatMap((g, i) => galaxies.slice(i + 1).map(gg => [g, gg]))
      .map(([[x0, y0], [x1, y1]]) => Math.abs(x0 - x1) + Math.abs(y0 - y1)
        + voidX.filter(x => x > Math.min(x0, x1) && x < Math.max(x0, x1)).length
        + voidY.filter(y => y > Math.min(y0, y1) && y < Math.max(y0, y1)).length)
      .reduce((sum, n) => sum + n, 0)
  },

  partII({ galaxies, voidX, voidY }) { // start 22:20, stop 22:22
    const expansion = 1_000_000
    return galaxies
      .flatMap((g, i) => galaxies.slice(i + 1).map(gg => [g, gg]))
      .map(([[x0, y0], [x1, y1]]) => Math.abs(x0 - x1) + Math.abs(y0 - y1)
        + voidX.filter(x => x > Math.min(x0, x1) && x < Math.max(x0, x1)).length * (expansion - 1)
        + voidY.filter(y => y > Math.min(y0, y1) && y < Math.max(y0, y1)).length * (expansion - 1))
      .reduce((sum, n) => sum + n, 0)
  },
})
