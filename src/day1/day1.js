'use strict';

import getInput from '../input.js';
import { range, sum } from '../utils.js';

const input = getInput(import.meta.url)
  .split(/\n/g)
  .map(Number);

// PART I:
console.log(
  'Part I:',
  input
    .reduce(({ prev, res }, depth) => ({ prev: depth, res: res + (depth > prev) }), { prev: Infinity, res: 0 })
    .res
);

// PART II:
const WINDOW_WIDTH = 3;
console.log(
  'Part II:',
  [...Array(input.length - (WINDOW_WIDTH - 1))]
    .map((_, i) => sum(range(WINDOW_WIDTH), j => input[i + j]))
    .reduce(({ prev, res }, depth) => ({ prev: depth, res: res + (depth > prev) }), { prev: Infinity, res: 0 })
    .res
);
