'use strict';

import getInput from '../input.js';
import { count, range } from '../utils.js';

/**
 * @type { { [key: string]: number }[] }
 */
const input = getInput(import.meta.url)
  .split(/\n/g)
  .map(line => /(?<x1>\d+),(?<y1>\d+) -> (?<x2>\d+),(?<y2>\d+)/.exec(line).groups)
  .map(Object.entries)
  .map(entries => entries.map(([k, v]) => [k, Number(v)]))
  .map(Object.fromEntries);

/** @type { Map<string, number> } */
const board = new Map();

// PART I:

input
  .filter(({ x1, y1, x2, y2 }) => x1 === x2 || y1 === y2) // vertical or horizontal lines
  .forEach(({ x1, y1, x2, y2 }) =>
    range(Math.abs(x2 - x1) + 1, { offset: x1, step: Math.sign(x2 - x1) }).map(
      x => range(Math.abs(y2 - y1) + 1, { offset: y1, step: Math.sign(y2 - y1) }).forEach(
        y => board.set(`${x}:${y}`, (board.get(`${x}:${y}`) ?? 0) + 1)
      )
    )
  );

console.log(
  'Part I:',
  count([...board.values()], overlap => overlap >= 2),
);

// PART II:

input
  .filter(({ x1, y1, x2, y2 }) => x1 !== x2 && y1 !== y2) // diagonal lines
  .forEach(({ x1, y1, x2, y2 }) =>
    range(Math.abs(x2 - x1) + 1, { offset: x1, step: Math.sign(x2 - x1) }).map(
      (x, i) => ({ x, y: y1 + Math.sign(y2 - y1) * i})
    ).forEach(({ x, y }) => board.set(`${x}:${y}`, (board.get(`${x}:${y}`) ?? 0) + 1))
  );

console.log(
  'Part II:',
  count([...board.values()], overlap => overlap >= 2),
);
