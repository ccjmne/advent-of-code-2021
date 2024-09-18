import { Priority, PriorityQueue } from 'src/data-structures/priority-queue';
import { forSure, isNil, isNotNil, Maybe } from 'src/maybe';
import solution from 'src/solution-module';
import { range, Tuple } from 'src/tsutils';

// start: 0118, stop:

type Amphipod = 'A' | 'B' | 'C' | 'D';

type Cell = Maybe<Amphipod>;
type Corridor = Tuple<Cell, 11>;
type Chamber = { at: number, type: Amphipod, slots: [Cell, Cell] };
type Chambers = [Chamber, Chamber, Chamber, Chamber];

function isSolved({ type, slots }: Chamber): boolean {
  return slots.every(a => a === type);
}

function destination(a: Amphipod, chambers: Chambers): Chamber {
  return forSure(chambers.find(({ type }) => type === a));
}

function draw([corridor, chambers]: [Corridor, Chambers]): string {
  return `
┌───────────┐
│${corridor.map(a => a ?? '.').join('')}│
└─┐${chambers.map(({ slots: [a] }) => a ?? '.').join('│')}┌─┘
  │${chambers.map(({ slots: [, a] }) => a ?? '.').join('│')}│
  └─┴─┴─┴─┘
`.trim();
}

// function solve(corridor: Corridor, chambers: Chambers): [Corridor, number] {
//   console.log(draw([corridor, chambers]));
//   if (chambers.every(isSolved)) {
//     return [corridor, 0];
//   }

//   // empty corridor, select candidate for placement
//   if (corridor.every(isNil)) {
//     const easy = chambers
//       .filter(chamber => !isSolved(chamber))
//       .filter(({ slots: [a] }) => destination(forSure(a), chambers).slots[1] === a);

//     easy.map(({ at, slots: [a] }) => console.log(`move`, a, `from chamber`, (at - 2) / 2, `to chamber`, (destination(forSure(a), chambers).at - 2) / 2));

//     console.log(easy);
//   }

//   return [corridor, 0];
// }

type Nest = [Corridor, Chambers];

function moves([corridor, chambers]: Nest): ReadonlyArray<{ nest: Nest, cost: number }> {
  const legalMoves = corridor.flatMap((a, i) => {
    // an Amphipod that's in the corridor doesn't move until it can simply go into its destination chamber.
    if (isNil(a)) {
      return [];
    }

    const chamber = destination(a, chambers);

    if (range(Math.abs(chamber.at - i), { offset: i, step: Math.sign(chamber.at - i) }).map(j => corridor[j]).some(isNotNil)) {
      // can't make it to the chamber
      return [];
    }

    let j = 0;
    let res = -1;
    while (isNil(chamber.slots[j])) {
      res = j;
      j++;
    }
    while (chamber.slots[j] === a) {
      j++;
    }

    if (j !== chamber.slots.length) {
      // the entire chamber wasn't like: `[...null[], ...A[]]`, where <A> is the right type of Amphipod.
      return [];
    }

    return [{
      nest: [
        corridor.map((c, k) => (k === i ? null : c)),
        chambers.map(c => (c.at === chamber.at ? ({
          ...chamber,
          slots: chamber.slots.map((s, l) => (l === res ? a : s)),
        }) : c)),
      ] as Nest,
      cost: (res + 1 + Math.abs(chamber.at - i)) * 10 ** 'ABCD'.indexOf(a),
    }];
  });

  // chambers.flatMap(c => isSolved(c) ? [] : {

  //   return [];
  // })

  return legalMoves;
}

function djikstra(start: Nest): { moves: Nest[], cost: number } {
  const solved: Nest = [<Corridor> Array(11), <Chambers>Array.from('ABCD', (type: Amphipod, i) => ({ at: i * 2 + 2, type, slots: [type, type] }))];
  const visited: Set<string> = new Set();
  const queue = new PriorityQueue(draw, Priority.ASC);
  const end = draw(solved);
  queue.enqueue(start, 0);

  let current: Nest;
  let total: number;
  do {
    [current, total] = queue.dequeueWithPriority();
    visited.add(draw(current));
    moves(current).forEach(({ nest, cost }) => queue.enqueue(nest, total + cost)); // eslint-disable-line no-loop-func
  } while (draw(current) !== end && !queue.isEmpty());

  if (draw(current) !== end) {
    console.log('not found!');
  }

  return { moves: [current], cost: total };
}

export default solution({
  parse(data: string): Nest {
    return [
      <Corridor>Array(11).fill(null),
      <Chambers>[...data.matchAll(/[ABCD]/gm)].reduce(
        (chambers, [a]: [Amphipod], i) => (chambers[i % 4].slots.push(a) && chambers),
        <Chambers>Array.from('ABCD', (type: Amphipod, i) => ({ at: i * 2 + 2, type, slots: <Amphipod[]>[] })),
      ),
    ];
  },

  partI(nest: Nest): number {
    return djikstra(nest).cost;
  },

  // eslint-disable-next-line
  partII(nest: Nest): number {
    return djikstra(nest).cost;
  },
});
