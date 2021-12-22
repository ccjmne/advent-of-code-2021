import { forSure } from 'src/maybe';
import solution from 'src/solution-module';
import { max, min, sum } from 'src/tsutils';

function mod1(mod: number, n: number): number {
  return ((n - 1) % mod) + 1;
}

function splice(array: [number, number], pos: 0 | 1, value: number): [number, number] {
  return Object.assign([...array], { [pos]: value }) as [number, number];
}

const DIRAC = [1, 2, 3];
const MEMOIZED = new Map<string, [number, number]>();
function victories(areas: [number, number], scores: [number, number], player: 0 | 1): [number, number] {
  const hash = JSON.stringify([areas, scores, player]);
  if (MEMOIZED.has(hash)) {
    return forSure(MEMOIZED.get(hash));
  }

  if (scores.some(score => score >= 21)) {
    return forSure(MEMOIZED
      .set(hash, scores.map(score => +(score >= 21)) as [number, number])
      .get(hash));
  }

  return forSure(MEMOIZED.set(hash, DIRAC.reduce(
    (outcomes1, die1) => DIRAC.reduce(
      (outcomes2, die2) => DIRAC.reduce(
        (outcomes3, die3) => {
          const area = mod1(10, areas[player] + die1 + die2 + die3);
          return victories(splice(areas, player, area), splice(scores, player, scores[player] + area), +!player as 0 | 1)
            .map((w, i) => w + outcomes3[i]) as [number, number];
        },
        outcomes2,
      ),
      outcomes1,
    ),
    [0, 0],
  )).get(hash));
}

export default solution({
  parse(input: string): [number, number] {
    return [...input.matchAll(/\d+$/gm)].map(Number) as [number, number];
  },

  partI(players: [number, number]): number {
    const areas = players.slice();
    const scores = [0, 0];

    let roll = 0;
    while (scores.every(score => score < 1000)) {
      scores[roll % 2] += areas[roll % 2] = mod1(10, areas[roll % 2] + sum([1, 2, 3], Δ => mod1(100, Δ + roll))); // eslint-disable-line
      roll += 3;
    }

    return min(scores) * roll;
  },

  partII(players: [number, number]): number {
    return max(victories(players, [0, 0], 0));
  },
});
