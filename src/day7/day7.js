'use strict';

import getInput from '../input.js';
import { min, range, sum } from '../utils.js';

const input = getInput(import.meta.url)
  .split(/,/g)
  .map(Number);

// PART I:

console.log(
  'Part I:',
  min(range(input.length, { offset: 1 }).map(pos => sum(input.map(at => Math.abs(pos - at))))),
);

// PART II:

function sum1toN(n) {
  return n * (n + 1) / 2;
}

console.log(
  'Part II:',
  min(range(input.length, { offset: 1 }).map(pos => sum(input.map(at => Math.abs(pos - at)).map(sum1toN)))),
);
