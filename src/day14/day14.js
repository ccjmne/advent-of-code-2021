'use strict';

import getInput from '../input.js';
import { aggregate, max, min, occurrences, range, sum } from '../utils.js';

const [TEMPLATE, RULES] = function([template, rules]) {
  return [
    template,
    rules.split(/\n/g).map(line => line.split(/ -> /))
      .reduce((acc, [pair, insert]) => ({ ...acc, [pair]: insert }), {}),
  ];
}(getInput(import.meta.url).split(/\n^$\n/m));

const LAST_SYMBOL = TEMPLATE.charAt(TEMPLATE.length - 1);

// PART I: (start: 1438, stop: 1453)

/** @param { string } template @returns { string } */
function step(template) {
  return range(template.length - 1)
    .reduce((acc, i) => `${ acc }${ template[i] }${ RULES[template[i] + template[i + 1]] }`, '')
    + LAST_SYMBOL;
}

const dictionary = occurrences(range(10).reduce(step, TEMPLATE).split(''));

console.log(
  'Part I:',
  max(Object.values(dictionary)) - min(Object.values(dictionary)),
);

// PART II: (start: 1454, stop: 1538)

/** @param { string } template @returns { { [key: string]: number } } */
function pairs(template) {
  return occurrences(range(template.length - 1).map(i => `${ template[i] }${ template[i + 1] }`));
}

/** @param { { [key: string]: number } } pairs @returns { { [key: string]: number } } */
function step2(pairs) {
  return Object.entries(pairs)
    .flatMap(([pair, count]) => [
      [`${ pair[0] }${ RULES[pair] }`, count],
      [`${ RULES[pair] }${ pair[1] }`, count],
    ])
    .reduce((acc, [pair, count]) => ({ ...acc, [pair]: (acc[pair] ?? 0) + count }), {}) ;
}

const dictionary2 = aggregate(
  Object.entries(range(40).reduce(step2, pairs(TEMPLATE))),
  ([[symbol]]) => symbol,
  (counts, symbol) => sum(counts, ([, count]) => count) + +(symbol === LAST_SYMBOL),
);

console.log(
  'Part II:',
  max(Object.values(dictionary2)) - min(Object.values(dictionary2)),
);
