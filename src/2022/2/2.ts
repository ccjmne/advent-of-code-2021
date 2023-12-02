import { forSure } from 'src/maybe';
import solution from 'src/solution-module';
import { sum } from 'src/tsutils';

export default solution({
  parse(data: string): ReadonlyArray<['A' | 'B' | 'C', 'X' | 'Y' | 'Z']> {
    return data
      .split(/\n/g)
      .map(round => round.match(/[A-CX-Z]/g) as ['A' | 'B' | 'C', 'X' | 'Y' | 'Z']);
  },

  partI(input: ReadonlyArray<['A' | 'B' | 'C', 'X' | 'Y' | 'Z']>): number {
    return sum(
      input
        .map(([opponent, me]) => ['ABC'.indexOf(opponent), 'XYZ'.indexOf(me)])
        .map(([opponent, me]) => me + 1 + forSure([3, 6, 0].at(me - opponent))),
    );
  },

  partII(input: ReadonlyArray<['A' | 'B' | 'C', 'X' | 'Y' | 'Z']>): number {
    return sum(
      input
        .map(([opponent, goal]) => ['ABC'.indexOf(opponent), 'XYZ'.indexOf(goal)])
        .map(([opponent, goal]) => goal * 3 + ((opponent + [-1, 0, 1][goal] + 3) % 3) + 1),
    );
  },
});
