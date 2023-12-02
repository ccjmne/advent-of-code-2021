import PriorityQueue from './priority-queue'

export default function solve<H extends number | string>(
  from: H,
  to: H,
  findNeighbours: (hash: H) => [number, H][],
): { cost: number, path: H[] } {
  const visited: Map<H, { parent: H | null, cost: number }> = new Map()
  const queue: PriorityQueue<H> = new PriorityQueue([0, from])

  console.log(from, to)

  let cur: H
  let prev: H | null = null
  let cost: number
  do {
    [cost, cur] = queue.dequeue()

    visited.set(cur, { parent: prev, cost })
    prev = cur
    queue.enqueueAll(
      ...findNeighbours(cur)
        .map(([c, h]) => [cost + c, h] as [number, H]) // eslint-disable-line no-loop-func
        .filter(([, h]) => !visited.has(h)),
    )
  } while (queue.size && cur !== to)

  if (cur === to) {
    const path = [to]
    while (cur !== from) {
      cur = visited.get(cur)!.parent!
      path.push(cur)
    }

    return { path, cost }
  }

  throw new Error('unsolvable')
}
