import { RegExpWGroups } from 'src/types'

import { has } from 'src/maybe'
import solution from 'src/solution-module'
import { aggregate, max, min } from 'src/tsutils'

type Cave = { valve: string, flow: number, tunnels: string[] }

const memoize = <T = any>(fn: Function) => {
  const cache = new Map()
  const cached = function (this: any, val: T) {
    const { flow: _, ...asdf } = val as unknown as { flow: number }
    const v = JSON.stringify(asdf)
    // console.log(v)
    return cache.has(v)
      ? cache.get(v)
      : cache.set(v, fn.call(this, val)) && cache.get(v)
  }
  cached.cache = cache
  return cached
}

export default solution({
  parse(data: string): Cave[] {
    return data
      .split(/\n/g)
      .map(line => ({
        ...(/^Valve (?<valve>[A-Z]{2}).*flow rate=(?<flow>\d+)/.exec(line) as RegExpWGroups<'valve' | 'flow'>).groups,
        tunnels: line.match(/(?<=(?:valves?|,) )[A-Z]{2}/g)!,
      }))
      .map(({ valve, flow, tunnels }) => ({ valve, flow: Number(flow), tunnels }))
  },

  partI(input) {
    // const caves = input.reduce((acc, cave) => ({ ...acc, [cave.valve]: cave }), {}) as Record<string, Cave>

    // const maxTime = 30

    // type State = { cave: string, time: number, total: number, open: string[] }
    // const state2 = { cave: 'AA', time: maxTime, total: 0, open: [] }

    // const eric = memoize(({ cave, time, total, open }: State): State => {
    //   // console.log({ cave, time, total, open })
    //   if (time < 1) {
    //     return { cave, time, total, open }
    //   }

    //   const cavee = caves[cave]
    //   // console.log(cavee)

    //   // stop doing anything
    //   const endthere = { cave, time: 0, total, open }
    //   // open valve
    //   const openValve = {
    //     cave,
    //     time: time - 1,
    //     total: total + (cavee.flow * (time - 1)),
    //     open: [...open, cave].sort(),
    //   }
    //   // move
    //   const move = (c: string) => ({ cave: c, time: time - 1, total, open })

    //   return max([
    //     endthere,
    //     ...(open.includes(cave) || cavee.flow === 0 ? [] : [openValve]),
    //     ...cavee.tunnels.map(move),
    //   ].map(eric), ({ total: t }) => t)
    // })

    // return eric(state2)
    function s2n(name: string): number {
      return (name.charCodeAt(0) - 'A'.charCodeAt(0)) * 26 + (name.charCodeAt(1) - 'A'.charCodeAt(0))
    }

    type bitmask = number
    type Hash = number

    const R = input.map(({ valve, flow, tunnels }) => [s2n(valve), flow, tunnels.map(s2n)] as const)

    // return input.map(({ valve, flow, tunnels }) => [s2n(valve), flow, tunnels.map(s2n).reduce((mask, i) => mask | i, 0b0) as bitmask])
    function hash(at: number, time: number, open: bitmask): Hash {
      return time + at * 31 + open * 31 * (26 * 26)
    }

    const mem: Map<Hash, number> = new Map()
    function getMax(at: number, time: number, open: bitmask): number {
      if (time <= 1) {
        return 0
      }
      // time should fit on 5 bits, give it 8
      const h: Hash = hash(at, time, open)
      if (mem.has(h)) {
        return mem.get(h)!
      }

      // console.log(at)

      // console.log(R, at)

      const valveIsOpen = !!(open & (0b1 << at))
      // console.log('isOpen', valveIsOpen)
      const Rat = R.find(([v]) => at === v)!
      const isWorthOpening = !!Rat[1]

      // console.log('isWorthOpening', isWorthOpening)

      let res = 0
      if (!valveIsOpen && isWorthOpening) {
        // create a new branch in which we open the current valve
        const newOpened = open | (0b1 << at)
        res = Math.max(res, (time - 1) * Rat[1] + getMax(at, time - 1, newOpened))
      }

      res = Math.max(
        res,
        ...Rat[2].map(att => getMax(att, time - 1, open)),
      )

      mem.set(h, res)
      return res
    }

    return getMax(0, 30, 0b0)
  },

  partII(input) {
    // function s2n(name: string): number {
    //   return (name.charCodeAt(0) - 'A'.charCodeAt(0)) * 26 + (name.charCodeAt(1) - 'A'.charCodeAt(0))
    // }

    // type bitmask = number
    // type Hash = string

    // const asdf = input.reduce((acc, { valve }, i) => ({ ...acc, [valve]: i }), {}) as Record<string, number>

    // // const R = input.map(({ valve, flow, tunnels }) => [s2n(valve), flow, tunnels.map(s2n)] as const)
    // const R = input.map(({ valve, flow, tunnels }) => [asdf[valve], flow, tunnels.map(t => asdf[t])] as const)
    // // console.log(R)

    // // return input.map(({ valve, flow, tunnels }) => [s2n(valve), flow, tunnels.map(s2n).reduce((mask, i) => mask | i, 0b0) as bitmask])
    // function hash(at: number, time: number, open: bitmask): Hash {
    //   return `${time} ${at * 31} ${open * 31 * input.length}`
    // }

    // const mem: Map<Hash, number> = new Map()
    // function getMax(at: number, time: number, open: bitmask): number {
    //   // time should fit on 5 bits, give it 8
    //   if (time <= 1) {
    //     return 0
    //     // return other ? getMax(0, 26, open, false) : 0
    //     // return mem.set(h, other ? getMax(0, 26, open, false) : 0).get(h)!
    //   }
    //   const h: Hash = hash(at, time, open)
    //   if (mem.has(h)) {
    //     return mem.get(h)!
    //   }

    //   // console.log(at)

    //   // console.log(R, at)

    //   const valveIsOpen = !!(open & (0b1 << at))
    //   // console.log('isOpen', valveIsOpen)
    //   const Rat = R.find(([v]) => at === v)!
    //   // console.log(at)
    //   const isWorthOpening = !!Rat[1]

    //   // console.log('isWorthOpening', isWorthOpening)

    //   let res = 0
    //   if (!valveIsOpen && isWorthOpening) {
    //     // create a new branch in which we open the current valve
    //     res = Math.max(res, (time - 1) * Rat[1] + getMax(at, time - 1, open | (0b1 << at)))
    //   }

    //   res = Math.max(
    //     res,
    //     ...Rat[2].map(att => getMax(att, time - 1, open)),
    //   )

    //   mem.set(h, res)
    //   return res
    // }

    // return getMax(asdf.AA, 30, 0b0)
    function s2n(name: string): number {
      return (name.charCodeAt(0) - 'A'.charCodeAt(0)) * 26 + (name.charCodeAt(1) - 'A'.charCodeAt(0))
    }

    type bitmask = number
    type Hash = string

    const R = input.map(({ valve, flow, tunnels }) => [s2n(valve), flow, tunnels.map(s2n)] as const)

    // return input.map(({ valve, flow, tunnels }) => [s2n(valve), flow, tunnels.map(s2n).reduce((mask, i) => mask | i, 0b0) as bitmask])
    function hash(at: number, time: number, open: bitmask, other: boolean): Hash {
      return `${time} ${at} ${open} ${other}`
    }

    const mem: Map<Hash, number> = new Map()
    function getMax(at: number, time: number, open: bitmask, other: boolean): number {
      if (time === 0) {
        return other ? getMax(0, 26, open, false) : 0
      }
      // time should fit on 5 bits, give it 8
      const h: Hash = hash(at, time, open, other)
      if (mem.has(h)) {
        return mem.get(h)!
      }

      // console.log(at)

      // console.log(R, at)

      const valveIsOpen = !!(open & (0b1 << at))
      // console.log('isOpen', valveIsOpen)
      const Rat = R.find(([v]) => at === v)!
      const isWorthOpening = !!Rat[1]

      // console.log('isWorthOpening', isWorthOpening)

      let res = 0
      if (!valveIsOpen && isWorthOpening) {
        // create a new branch in which we open the current valve
        const newOpened = open | (0b1 << at)
        res = Math.max(res, (time - 1) * Rat[1] + getMax(at, time - 1, newOpened, other))
      }

      if (other) {
        // just stop here
        res = Math.max(res, getMax(0, 26, open, false))
      }

      res = Math.max(
        res,
        ...Rat[2].map(att => getMax(att, time - 1, open, other)),
      )

      mem.set(h, res)
      return res
    }

    return getMax(0, 26, 0b0, true)

    // let mxx = 0
    // mem.forEach((v, k) => {
    //   const open1 = Number(k.split(/ /g)[2])
    //   let mx = 0

    //   mem.forEach((v2, k2) => {
    //     const open2 = Number(k2.split(/ /g)[2])
    //     if (!(open2 & open1)) {
    //       mx = Math.max(mx, v2)
    //     }
    //   })
    //   // [...mem.entries()].filter(([k2, v2]) => {
    //   // })
    //   mxx = Math.max(mxx, mx + v)
    // })

    // return mxx

    return mem.size
  },
})
