import solution from 'src/solution-module';
import { UnreachableCaseError } from 'src/tsutils';
import { type RegExpWGroups } from 'src/types.d';

class Knot {

  private constructor(public readonly x: number, public readonly y: number) {}

  public static origin(): Knot {
    return new Knot(0, 0);
  }

  public move(dir: 'U' | 'D' | 'L' | 'R'): Knot {
    switch (dir) {
    case 'U':
      return new Knot(this.x, this.y + 1);
    case 'D':
      return new Knot(this.x, this.y - 1);
    case 'L':
      return new Knot(this.x - 1, this.y);
    case 'R':
      return new Knot(this.x + 1, this.y);
    default:
      throw new UnreachableCaseError();
    }
  }

  public catchUpTo({ x, y }: Knot): Knot {
    const target = new Knot(this.x + Math.sign(x - this.x), this.y + Math.sign(y - this.y));
    return (target.x === x && target.y === y) ? this : target;
  }

  public serialise(): `${number},${number}` {
    return `${this.x},${this.y}`;
  }

}

export default solution({
  parse(data: string): ReadonlyArray<{ dir: 'U' | 'D' | 'L' | 'R', reps: number }> {
    return data
      .split(/\n/g)
      .map(line => /^(?<dir>[UDLR]) (?<reps>\d+)$/.exec(line) as RegExpWGroups<'dir' | 'reps'>)
      .map(({ groups: { dir, reps } }) => ({ dir: dir as 'U' | 'D' | 'L' | 'R', reps: Number(reps) }));
  },

  partI(input: ReadonlyArray<{ dir: 'U' | 'D' | 'L' | 'R', reps: number }>): number {
    return input
      .flatMap(({ dir, reps }) => Array.from({ length: reps }, () => dir))
      .reduce(
        ({ H, T, visited }, dir) => {
          const Hnext = H.move(dir);
          const Tnext = T.catchUpTo(Hnext);
          return ({ H: Hnext, T: Tnext, visited: visited.add(Tnext.serialise()) });
        },
        { H: Knot.origin(), T: Knot.origin(), visited: new Set<`${number},${number}`>() },
      )
      .visited.size;
  },

  partII(input) {
    return input
      .flatMap(({ dir, reps }) => Array.from({ length: reps }, () => dir))
      .reduce(
        ({ rope: [head, ...rope], visited }, dir) => {
          const ropeNext = rope.reduce((knots, knot, i) => [...knots, knot.catchUpTo(knots[i])], [head.move(dir)]);
          return { rope: ropeNext, visited: visited.add(ropeNext.at(-1)!.serialise()) };
        },
        { rope: Array.from({ length: 10 }, () => Knot.origin()), visited: new Set<`${number},${number}`>() },
      ).visited.size;
  },
});
