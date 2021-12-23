import solution from 'src/solution-module';
import { sum, zip } from 'src/tsutils';

type Bounds = [number, number];
type Cuboid1 = [Bounds];
type Cuboid2 = [Bounds, Bounds];
type Cuboid3 = [Bounds, Bounds, Bounds];
type Cuboid = Cuboid3;

function size(cuboid: Cuboid): number {
  // TODO: maybe no need for `Math.max(0, x)` if Cuboids are always encoded properly.
  return cuboid.reduce((product, [lo, hi]) => product * Math.max(0, (hi - lo)), 1);
}

function intersection(a: Cuboid, b: Cuboid): Cuboid {
  return zip(a, b)
    .map(([[lo1, hi1], [lo2, hi2]]) => [Math.min(hi1, hi2), Math.max(lo1, lo2)].sort()) as Cuboid;
}

function diff1(a: Cuboid1, b: Cuboid1): [Cuboid1, Cuboid1] {
  const [[[lo1, hi1]], [[lo2, hi2]]] = [a, b];
  return [[[lo1, Math.max(lo1, Math.min(hi1, lo2))]], [[Math.min(hi1, Math.max(lo1, hi2)), hi1]]];
}

function diff2(a: Cuboid2, b: Cuboid2): [Cuboid2, Cuboid2, Cuboid2, Cuboid2] {
  const [xAnte, xPost] = diff1(a.slice(0, 1) as Cuboid1, b.slice(0, 1) as Cuboid1);
  const [yAnte, yPost] = diff1([a[1]], [b[1]]);
  return [[a[0], yAnte[0]], [xAnte[0], [yAnte[0][1], yPost[0][0]]], [xPost[0], [yAnte[0][1], yPost[0][0]]], [a[0], yPost[0]]];
}

function diff3(a: Cuboid3, b: Cuboid3): [Cuboid3, Cuboid3, Cuboid3, Cuboid3, Cuboid3, Cuboid3] {
  const [xYAnte, xAnteYMid, xPostYMid, xYPost] = diff2(a.slice(0, 2) as Cuboid2, b.slice(0, 2) as Cuboid2);
  const [[zAnte], [zPost]] = diff1([a[2]], [b[2]]);

  return [
    [...a.slice(0, 2) as Cuboid2, zAnte],

    [...xYAnte, [zAnte[1], zPost[0]]],
    [...xAnteYMid, [zAnte[1], zPost[0]]],
    [...xPostYMid, [zAnte[1], zPost[0]]],
    [...xYPost, [zAnte[1], zPost[0]]],

    [...a.slice(0, 2) as Cuboid2, zPost],
  ];
}

/**
 * Failed attempt at generalising `diff` for rectangular "cuboids" of **any** number of dimensions.
 */

// type RightoidN<N extends number> = Tuple<Bounds, N>;
// function isect<N extends number>(a: RightoidN<N>, b: RightoidN<N>): RightoidN<N> {
//   return zip(a, b)
//     .map(([[lo1, hi1], [lo2, hi2]]) => [Math.min(hi1, hi2), Math.max(lo1, lo2)].sort()) as RightoidN<N>;
// }
// function diff<N extends number>(a: RightoidN<N>, b: RightoidN<N>): RightoidN<N>[] {
//   if (!a.length) {
//     return [];
//   }
//   if (a.length === 1) {
//     const [[[lo1, hi1]], [[lo2, hi2]]] = [a, b];
//     return [[[lo1, Math.max(lo1, Math.min(hi1, lo2))]], [[Math.min(hi1, Math.max(lo1, hi2)), hi1]]] as RightoidN<N>[];
//   }
//   const [i] = isect(a.slice(-1), b.slice(-1)) as RightoidN<1>;
//   return [
//     ...diff(a.slice(-1), b.slice(-1)).flatMap(rightoids1 => rightoids1.map(bounds => [...a.slice(0, -1), bounds])),
//     ...diff(a.slice(0, -1), b.slice(0, -1)).map(bounds => [...bounds, i]),
//   ] as RightoidN<N>[];
// }

export default solution({
  parse(data: string): ReadonlyArray<[boolean, Cuboid]> {
    return data.trim().split(/\n/g)
      .map(line => line.split(' ')).map(
        ([state, coords]) => [state === 'on', [...coords.matchAll(/=(-?\d+)\.\.(-?\d+)/g)].map(([, lo, hi]) => [+lo, +hi + 1]) as Cuboid],
      );
  },

  partI(instructions: ReadonlyArray<[boolean, Cuboid]>): number {
    return sum(instructions
      .filter(([, cuboid]) => cuboid.flat().every(n => n >= -50 && n <= 51))
      .reduce(
        (cuboids, [state, cuboid]) => cuboids.flatMap(c => diff3(c, cuboid).filter(d => !!size(d))).concat(state ? [cuboid] : []),
        [],
      )
      .map(size));
  },

  partII(instructions: ReadonlyArray<[boolean, Cuboid]>): number {
    return sum(instructions
      .reduce(
        (cuboids, [state, cuboid]) => cuboids.flatMap(c => diff3(c, cuboid).filter(d => !!size(d))).concat(state ? [cuboid] : []),
        [],
      )
      .map(size));
  },
});
