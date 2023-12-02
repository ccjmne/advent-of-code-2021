import { isNotNil } from 'src/maybe';
import solution from 'src/solution-module';
import { range } from 'src/tsutils';
import { type RegExpWGroups } from 'src/types.d';

export default solution({
  parse(data: string): { stacks: string[][], instructions: { move: number, from: number, to: number }[] } {
    const [crates, instructions] = data.split(/\n[ 0-9]+\n\n/m);
    const cratesLines = crates
      .split(/\n/g)
      .map(line => [...line.matchAll(/(?<=^| )(\[(?<crate>[A-Z])\]| {3})/g)] as RegExpWGroups<'crate'>[])
      .map(line => line.map(({ groups: { crate } }) => crate));

    return {
      stacks: range(cratesLines[0].length).map(
        (_, i) => cratesLines.map(line => line[i]).filter(isNotNil),
      ),
      instructions: instructions
        .split(/\n/g)
        .map(line => line.match(/\d+/g)!.map(Number))
        .map(([move, from, to]) => ({ move, from: from - 1, to: to - 1 })),
    };
  },

  mutatesInput: true,
  partI({ stacks, instructions }: { stacks: string[][], instructions: { move: number, from: number, to: number }[] }): string {
    instructions.forEach(({ move, from, to }) => stacks[to].unshift(...stacks[from].splice(0, move).reverse()));
    return stacks.map(stack => stack[0]).join('');
  },

  partII({ stacks, instructions }: { stacks: string[][], instructions: { move: number, from: number, to: number }[] }): string {
    instructions.forEach(({ move, from, to }) => stacks[to].unshift(...stacks[from].splice(0, move)));
    return stacks.map(stack => stack[0]).join('');
  },
});
