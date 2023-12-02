import solution from 'src/solution-module';
import { sum } from 'src/tsutils';

export default solution({
  parse(data): ReadonlyArray<number[]> {
    return data
      .split(/\n^$\n/g)
      .map(lines => lines.split(/\n/g).map(Number));
  },

  partI(elves: ReadonlyArray<number[]>): number {
    return Math.max(...elves.map(foods => sum(foods)));
  },

  partII(elves: ReadonlyArray<number[]>): number {
    return sum(elves.map(foods => sum(foods)).sort((a, b) => a - b).slice(-3));
  },
});
