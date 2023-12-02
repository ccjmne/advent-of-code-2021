import solution from 'src/solution-module';
import { split, sum } from 'src/tsutils';

export default solution({
  parse(data: string): ReadonlyArray<[Set<string>, Set<string>]> {
    return data
      .split(/\n/g)
      .map(rucksack => rucksack.split(new RegExp(`(?<=^[a-zA-Z]{${rucksack.length / 2}})`)) as [string, string])
      .map(([left, right]) => [new Set(left.split('')), new Set(right.split(''))]);
  },

  partI(input: ReadonlyArray<[Set<string>, Set<string>]>): number {
    return sum(
      input
        .map(([left, right]) => [...left].find(item => right.has(item))!)
        .map(item => 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.indexOf(item) + 1),
    );
  },

  partII(input: ReadonlyArray<[Set<string>, Set<string>]>): number {
    return sum(
      split([...input], 3)
        .map(rucksacks => rucksacks.map(([left, right]) => new Set([...left, ...right])))
        .map(([first, second, third]) => [...first].find(item => second.has(item) && third.has(item))!)
        .map(item => 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.indexOf(item) + 1),
    );
  },
});
