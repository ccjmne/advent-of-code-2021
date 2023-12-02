import yargs from 'yargs'

import { type SolutionModule } from 'src/solution-module'
import { style, Styles } from 'src/tsutils'

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
  .argv

type ESModule<T> = { default: T }

console.info('-'.repeat(80))
console.info(`AoC ${style(String(y), Styles.BRIGHT)} • day ${style(String(d), Styles.BRIGHT)}`)
console.info(style('-'.repeat(80), Styles.DIM))

try {
  const { default: { parse, partI, partII, mutatesInput } } = await import(`src/${y}/${d}/${d}`) as ESModule<SolutionModule<unknown>>
  const { default: data } = await import(`src/${y}/${d}/input`) as ESModule<string>

  const input = parse(data)
  console.log('Part I:', ...[partI(input)].flat())
  console.log('Part II:', ...[partII(mutatesInput ? parse(data) : input)].flat())
} catch (_) {
  console.error(
    style('Unable to run solution for:', Styles.RED | Styles.BRIGHT),
    { year: y, day: d },
    style('\nExpected implementation in:', Styles.RED | Styles.BRIGHT),
    `src/${y}/${d}/${d}.ts`,
    style('\n         Expected input in:', Styles.RED | Styles.BRIGHT),
    `src/${y}/${d}/input`,
  )

  console.error(style('-'.repeat(80), Styles.DIM))
  console.error(_)
}
