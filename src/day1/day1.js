'use strict';

import getInput from '../input.js';

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
    .map((_, i) => [...Array(WINDOW_WIDTH)].reduce((sum, _, j) => sum + input[i + j], 0))
    .reduce(({ prev, res }, depth) => ({ prev: depth, res: res + (depth > prev) }), { prev: Infinity, res: 0 })
    .res
);
