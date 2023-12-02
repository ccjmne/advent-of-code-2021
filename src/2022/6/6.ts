import solution from 'src/solution-module';
import { range } from 'src/tsutils';

export default solution({
  parse(data: string): string[] {
    return data.split('');
  },

  partI(input: string[]): number {
    const WORD_SIZE = 4;
    return WORD_SIZE + input.findIndex(
      (_, i) => new Set(range(WORD_SIZE).map(offset => input[i + offset])).size === WORD_SIZE,
    );
  },

  partII(input: string[]): number {
    const WORD_SIZE = 14;
    return WORD_SIZE + input.findIndex(
      (_, i) => new Set(range(WORD_SIZE).map(offset => input[i + offset])).size === WORD_SIZE,
    );
  },
});
