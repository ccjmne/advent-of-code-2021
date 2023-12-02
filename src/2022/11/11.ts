import solution from 'src/solution-module'
import { mul, range } from 'src/tsutils'

type Monkey = {
  id: number;
  divisor: number;
  items: number[];
  inspect: (item: number) => number;
  choose: (worry: number) => number;
}

export default solution({
  parse(data: string): Monkey[] {
    return data
      .split(/\n^$\n/gm)
      .map((monkey, id) => ({
        id,
        divisor: Number(/Test: divisible by (\d+)$/m.exec(monkey)![1]),
        items: (monkey.match(/(?<=Starting items: (?:\d+, )*)(\d+)/g) ?? []).map(Number),
        // eslint-disable-next-line no-eval
        inspect: (old: number) => eval(`${/(?<=Operation: new = )(.*$)/m.exec(monkey)![1]}`.replace(/old/g, String(old))) as number,
        choose: (item: number) => Number(
          new RegExp(`${item % Number(/Test: divisible by (\d+)$/m.exec(monkey)![1]) === 0 ? 'true' : 'false'}: .*?(\\d+)$`, 'm')
            .exec(monkey)![1],
        ),
      }))
  },

  mutatesInput: true,
  partI(monkeys: Monkey[]): number {
    const inspections: Map<number, number> = new Map()
    range(20).forEach(() => monkeys.forEach(
      ({ id: monkey, items, inspect, choose }) => items
        .splice(0, Infinity)
        .map(inspect)
        .map(worry => Math.floor(worry / 3))
        .map(worry => ({ worry, target: choose(worry) }))
        .forEach(({ worry, target }) => {
          monkeys.find(({ id }) => id === target)!.items.push(worry)
          inspections.set(monkey, (inspections.get(monkey) ?? 0) + 1)
        }),
    ))

    return mul([...inspections.values()].sort((a, b) => a - b).slice(-2))
  },

  partII(monkeys: Monkey[]): number {
    const commonDivisor = mul(monkeys.map(({ divisor }) => divisor))
    const inspections: Map<number, number> = new Map()
    range(10000).forEach(() => monkeys.forEach(
      ({ id: monkey, items, inspect, choose }) => items
        .splice(0, Infinity)
        .map(inspect)
        .map(worry => worry % commonDivisor) // 🤯
        .map(worry => ({ worry, target: choose(worry) }))
        .forEach(({ worry, target }) => {
          monkeys.find(({ id }) => id === target)!.items.push(worry)
          inspections.set(monkey, (inspections.get(monkey) ?? 0) + 1)
        }),
    ))

    return mul([...inspections.values()].sort((a, b) => a - b).slice(-2))
  },
})
