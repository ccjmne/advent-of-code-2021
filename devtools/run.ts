import yargs from 'yargs';

import { SolutionModule } from 'src/solution-module';
import { style, Styles } from 'src/tsutils';

/* eslint-disable no-console */
/* eslint-disable no-bitwise */

const { y, d } = await yargs(process.argv)
  .option('d', {
    required: true,
    alias: 'day',
    default: new Date().getDate(),
  })
  .option('y', {
    required: true,
    alias: 'year',
    default: new Date().getFullYear(),
  })
  .help(false)
  .version(false)
  .argv;

type ESModule<T> = { default: T };

console.info(
  '\n'.padStart(80, '-'),
  `AoC ${style(String(y), Styles.BRIGHT)} • day ${style(String(d), Styles.BRIGHT)}`,
  '\n'.padEnd(80, '-'),
);

try {
  const { default: { parse, partI, partII } } = await import(/* webpackMode: 'eager' */`/src/${y}/${d}/${d}`) as ESModule<SolutionModule<unknown>>;
  const { default: data } = await import(/* webpackMode: 'eager' */`/src/${y}/${d}/input`) as ESModule<string>;

  const input = parse(data);
  const I = partI(input);
  console.log('Part I:', ...[I].flat());
  const II = partII(input);
  console.log('Part II:', ...[II].flat());
} catch (e) {
  console.error(
    style(`Unable to run solution for:`, Styles.RED | Styles.BRIGHT), { year: y, day: d },
    style(`\nExpected implementation in:`, Styles.RED | Styles.BRIGHT), `/src/${y}/${d}/${d}.ts`,
    style(`\n         Expected input in:`, Styles.RED | Styles.BRIGHT), `/src/${y}/${d}/input`,
  );

  console.error('\n'.padStart(80, '-'), e);
}
