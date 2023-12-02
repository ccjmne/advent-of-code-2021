import solution from 'src/solution-module'

class Sensor {

  public constructor(public readonly x: number, public readonly y: number, public readonly dist: number) {}

  public covers(x: number, y: number): boolean {
    return (Math.abs(x - this.x) + Math.abs(y - this.y)) <= this.dist
  }

  public coversArea({ x0, x1, y0, y1 }: { x0: number, x1: number, y0: number, y1: number }): boolean {
    return [[x0, y0], [x1, y0], [x0, y1], [x1, y1]].every(([x, y]) => this.covers(x, y))
  }

}

export default solution({
  parse(data: string): Sensor[] {
    return data
      .split(/\n/g)
      .map(line => line.match(/-?\d+/g)!.map(Number))
      .map(([x, y, bx, by]) => new Sensor(x, y, Math.abs(bx - x) + Math.abs(by - y)))
  },

  partI(sensors: Sensor[]): number {
    // See https://www.reddit.com/r/adventofcode/comments/zmcn64/comment/j0cdi3j/?utm_source=share&utm_medium=web2x&context=3
    //     import re

    // def dist(a,b): return abs(a[0]-b[0])+abs(a[1]-b[1])
    // def abcd2abr(a,b,c,d): return (a,b,dist((a,b),(c,d)))

    // maxi = 4000000
    // data = [ abcd2abr(*map(int,re.findall(r'[-]*\d+', line)))
    //         for line in Puzzle(day=15,year=2022).input_data.split("\n")]

    // intervals = sorted([ (x - d, x + d) for x, y, r in data
    //                     for d in [r-abs(maxi//2-y)] if d >= 0])
    // start, stop, holes = *intervals[0], 0

    // for nstart, nstop in intervals:
    //     holes, stop = max(0, nstart-stop-1), max(stop, nstop)

    // print("Part1:", stop - start - holes)

    // a = set(x-y+r+1 for x,y,r in data).intersection(x-y-r-1 for x,y,r in data).pop()
    // b = set(x+y+r+1 for x,y,r in data).intersection(x+y-r-1 for x,y,r in data).pop()

    // print("Part2:", (a+b)*maxi//2+(b-a)//2)

    const at = 2_000_000
    const ranges: [number, number][] = sensors.flatMap(({ x, y, dist }) => {
      const dx = (dist - Math.abs(at - y))
      return (dx > 0 ? [[x - dx, x + dx]] : []) as [number, number][]
    }).sort(([loa], [lob]) => loa - lob)

    const [[LO]] = ranges
    const res = ranges.reduce(({ HI, holes }, [lo, hi]) => ({
      HI: Math.max(HI, hi),
      holes: holes + Math.max(0, lo - HI),
    }), ({ HI: LO, holes: 0 }))

    return res.HI - LO - res.holes
  },

  partII(sensors: Sensor[]): number {
    function findInArea([x0, x1, y0, y1]: [number, number, number, number]): [number, number] | undefined {
      if (x0 === x1 && y0 === y1 && !sensors.some(sensor => sensor.covers(x0, y0))) {
        return [x0, y0]
      }

      const xMid = x0 + Math.floor((x1 - x0) / 2)
      const yMid = y0 + Math.floor((y1 - y0) / 2)
      // bypass area search if it is entirely covered by a sensor,
      // split into quadrants otherwise
      return sensors.some(sensor => sensor.coversArea({ x0, x1, y0, y1 }))
        ? undefined
        : findInArea([x0, xMid, y0, yMid])
          ?? findInArea([xMid + 1, x1, y0, yMid])
          ?? findInArea([x0, xMid, yMid + 1, y1])
          ?? findInArea([xMid + 1, x1, yMid + 1, y1])
    }

    const [x, y] = findInArea([0, 4_000_000, 0, 4_000_000])!
    return x * 4_000_000 + y
  },
})
