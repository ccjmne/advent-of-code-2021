import solution from 'src/solution-module';
import { count } from 'src/tsutils';

export default solution({
  parse(data: string): ReadonlyArray<{ lo1: number, hi1: number, lo2: number, hi2: number }> {
    return data
      .split(/\n/g)
      .map(line => line.match(/\d+/g)!.map(Number))
      .map(([lo1, hi1, lo2, hi2]) => (lo1 <= lo2 ? [lo1, hi1, lo2, hi2] : [lo2, hi2, lo1, hi1]))
      .map(([lo1, hi1, lo2, hi2]) => ({ lo1, hi1, lo2, hi2 }));
  },

  partI(input: ReadonlyArray<{ lo1: number, hi1: number, lo2: number, hi2: number }>): number {
    return count([...input], ({ lo1, hi1, lo2, hi2 }) => (hi2 <= hi1) || (lo2 <= lo1 && hi2 >= hi1));
  },

  partII(input: ReadonlyArray<{ lo1: number, hi1: number, lo2: number, hi2: number }>): number {
    return count([...input], ({ hi1, lo2 }) => (lo2 <= hi1));
  },
});
