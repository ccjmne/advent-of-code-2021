'use strict';

import getInput from '../input.js';
import { range, sum } from '../utils.js';

const input = getInput(import.meta.url)
  .split(/\n/g)
  .map(line => line.split('').map(Number));

const [width, height] = [input[0].length, input.length];

// PART I:

console.log(
  'Part I:',
  sum(range(width).map(
    x => sum(range(height).map(
      y =>
        (y === 0          || input[y][x] < input[y - 1][x]) &&
        (y === height - 1 || input[y][x] < input[y + 1][x]) &&
        (x === 0          || input[y][x] < input[y][x - 1]) &&
        (x === width - 1  || input[y][x] < input[y][x + 1])
        ? input[y][x] + 1
        : 0
    ))
  )),
);

// PART II:

/**
 * @typedef { { x: number, y: number, z: number, visited: boolean } } Cell
 * @type { Cell[] }
 */
const CELLS = input.flat().map((z, i) => ({ x: i % width, y: Math.floor(i / width), z, visited: z === 9 }));

/** @param { number } x @param { number } y @returns { Cell } */
function at(x, y) {
  return x >= 0 && x < width && y >= 0 && y < height
    ? CELLS[y * width + x]
    : null;
}

/** @param { Cell } cell @returns { Cell[] } */
function neighbours({ x, y }) {
  return [
    at(x - 1, y),
    at(x + 1, y),
    at(x, y - 1),
    at(x, y + 1),
  ].filter(cell => !!cell && cell.z < 9 && !cell.visited);
}

/** @param { Cell } cell @returns { number } */
function findBasinSize(cell) {
  if (cell.z === 9 || cell.visited) {
    return 0;
  }

  cell.visited = true;
  return 1 + sum(neighbours(cell).map(neighbour => findBasinSize(neighbour)));
}

const [a, b, c] = CELLS.map(cell => cell.visited ? 0 : findBasinSize(cell)).sort((a, b) => b - a);
console.log(
  'Part II:',
  '\n> Largest basins:', a, b, c,
  '\n> End result:', a * b * c,
);
