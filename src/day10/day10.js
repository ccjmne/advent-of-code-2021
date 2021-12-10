'use strict';

import getInput from '../input.js';
import { sum } from '../utils.js';

const input = getInput(import.meta.url).split(/\n/);

const PAIRS = { '(': ')', '[': ']', '{': '}', '<': '>' };
const MATCHING = /\(\)|\[\]|\{\}|\<\>/g;
const OPEN_AND_CLOSE = /[([{<][)\]}>]/g;

/** @param { string } line @returns { [string, string] } */
function scan(line) {
  if (line === '') {
    return ['', '']; // No error: expected '', found: ''
  }

  if (!new RegExp(OPEN_AND_CLOSE).test(line)) {
    return [line.split('').reverse().map(open => PAIRS[open]).join(''), null]; // Incomplete: expected AUTOCOMPLETED expectation, found: null
  }

  const unmatched = [...line.matchAll(new RegExp(OPEN_AND_CLOSE))].find(([pair]) => !new RegExp(MATCHING).test(pair));
  if (unmatched) {
    const [[open, close]] = unmatched;
    return [PAIRS[open], close]; // [expected, found]
  }

  return scan(line.replace(new RegExp(MATCHING), ''));
}

// PART I: (start: 1323, stop: 1426)

console.log(
  'Part I:',
  sum(input
    .map(scan)
    .filter(([, found]) => found !== null)
    .map(/** @returns { number } */ ([, found]) => ({ ')': 3, ']': 57, '}': 1197, '>': 25137 }[found] ?? 0))
  ),
);

// PART II: (start: 1433, stop: 1447)

const scores = input
  .map(scan)
  .filter(([, found]) => found === null)
  .map(([expected]) => expected
    .split('')
    .map(/** @returns { number } */ close => ({ ')': 1,']': 2,'}': 3,'>': 4 }[close] ?? 0))
    .reduce((score, worth) => score * 5 + worth, 0)
  )
  .sort((a, b) => a - b);

console.log(
  'Part II:', scores[Math.floor(scores.length / 2)],
);
