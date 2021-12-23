import solution from 'src/solution-module';
import { sum, Tuple, zip } from 'src/tsutils';

type Bounds = [number, number];
type RectN<N extends number> = Tuple<Bounds, N>;
type Cuboid = RectN<3>;

/**
 * Size of a Rectangular shape of **any** number of dimensions.
 */
function size(a: RectN<number>): number {
  return a.reduce((product, [lo, hi]) => product * (hi - lo), 1);
}

/**
 * Intersection of two rectangular shapes of **any** number of dimensions.
 *
 * @returns a single N-dimensional rectangular shape
 */
function inter<N extends number>(a: RectN<N>, b: RectN<N>): RectN<N> {
  return zip(a, b)
    .map(([[lo1, hi1], [lo2, hi2]]) => [Math.max(lo1, Math.min(hi1, lo2)), Math.min(hi1, Math.max(lo1, hi2))]) as RectN<N>;
}

/**
 * Difference of two rectangular shapes of **any** number of dimensions.
 *
 * @returns up to `2 * N` N-dimensional rectangular shapes
 */
function diff<N extends number>(a: RectN<N>, b: RectN<N>): RectN<N>[] {
  if (!a.length) {
    return [];
  }

  if (a.length === 1) {
    const [[[lo1, hi1]], [[lo2, hi2]]] = [a, b];
    return [[[lo1, Math.max(lo1, Math.min(hi1, lo2))]], [[Math.min(hi1, Math.max(lo1, hi2)), hi1]]].filter(size) as RectN<N>[];
  }

  return [
    ...diff(a.slice(-1), b.slice(-1)).flatMap(n => n.map(bounds => [...a.slice(0, -1), bounds])),
    ...diff(a.slice(0, -1), b.slice(0, -1)).map(bounds => [...bounds, ...inter(a.slice(-1), b.slice(-1))]),
  ].filter(size) as RectN<N>[];
}

export default solution({
  parse(data: string): ReadonlyArray<[boolean, Cuboid]> {
    return data.trim().split(/\n/g)
      .map(line => line.split(' ')).map(
        ([state, coords]) => [state === 'on', [...coords.matchAll(/=(-?\d+)\.\.(-?\d+)/g)].map(([, lo, hi]) => [+lo, +hi + 1]) as RectN<3>],
      );
  },

  partI(instructions: ReadonlyArray<[boolean, Cuboid]>): number {
    return sum(instructions
      .filter(([, cuboid]) => cuboid.flat().every(n => n >= -50 && n <= 51))
      .reduce(
        (cuboids, [state, cuboid]) => cuboids.flatMap(c => diff(c, cuboid)).concat(state ? [cuboid] : []),
        [],
      )
      .map(size));
  },

  partII(instructions: ReadonlyArray<[boolean, Cuboid]>): number {
    return sum(instructions.reduce(
      (cuboids, [state, cuboid]) => cuboids.flatMap(c => diff(c, cuboid)).concat(state ? [cuboid] : []),
      [],
    ).map(size));
  },
});
