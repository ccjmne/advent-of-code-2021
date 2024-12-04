import solution from "src/solution-module"

export default solution({
  parse(data: string) {
    return data.trim().split(/\n/g).map(line => line.match(/\d+/g)!.map(Number))
  },

  partI(input) {
    return input
      .map(report => report.slice(1).map((r, i) => [report[i], r])
        .map(([l, r]) => ({ delta: Math.abs(r - l), dir: Math.sign(r - l) }))
        .reduce(
          ({ prev, ok }, { delta, dir }) => ({ prev: dir, ok: ok && (!prev || prev === dir) && (0 < delta && delta <= 3) }),
          { prev: 0, ok: true }))
      .filter(({ ok }) => ok)
      .length
  },

  partII(input) {
    return input
      .map(report => [report].concat(Array.from(report, (_, i) => report.slice(0, i).concat(report.slice(i + 1)))))
      .map(perms => perms.map(report => report.slice(1).map((r, i) => [report[i], r])
        .map(([l, r]) => ({ delta: Math.abs(r - l), dir: Math.sign(r - l) }))
        .reduce(
          ({ prev, ok }, { delta, dir }) => ({ prev: dir, ok: ok && (!prev || prev === dir) && (0 < delta && delta <= 3) }),
          { prev: 0, ok: true })))
      .filter(perms => perms.some(({ ok }) => ok))
      .length
  },
});
