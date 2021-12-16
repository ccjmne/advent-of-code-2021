'use strict';

import getInput from '../input.js';
import PriorityQueue from '../priority-queue.js';
import { range } from '../utils.js';

const input = getInput(import.meta.url).split(/\n/g).map(line => line.split('').map(Number));

const SCALE = 5;
const [WIDTH, HEIGHT] = [input[0].length * SCALE, input.length * SCALE];

const totals = range(HEIGHT).map(() => range(WIDTH).map(() => null));
totals[0][0] = 0;

/** @param { [number, number] } xy @returns { [number, number][] } */
function neighbours([x, y]) {
  return [[0, -1], [0, 1], [-1, 0], [1, 0]]
    .map(([i, j]) => [x + i, y + j])
    .filter(([i, j]) => i >= 0 && i < WIDTH && j >= 0 && j < HEIGHT);
}

/** @param { [number, number ] } xy @returns { number } */
function hash([x, y]) {
  return y * WIDTH + x;
}

/** @param { number } i @returns { [number, number] } */
function dehash(i) {
  return [i % WIDTH, Math.floor(i / WIDTH)];
}

/** @param { [number, number] } xy @returns { number } */
function risk([x, y]) {
  const [w, h] = [WIDTH / SCALE, HEIGHT / SCALE];
  const [i, chunkI] = [x % w, Math.floor(x / w)];
  const [j, chunkJ] = [y % h, Math.floor(y / h)];

  return ((input[j][i] + chunkI + chunkJ - 1) % 9) + 1;
}

/** @param { [number, number] } xy @returns { number } */
function total([x, y]) {
  return totals[y][x];
}

const visited = new Set();
const queue = new PriorityQueue([0, hash([0, 0])]);

let xy;

do {
  const i = queue.dequeue();
  visited.add(i);
  xy = dehash(i);
  neighbours(xy).forEach((ij) => totals[ij[1]][ij[0]] = Math.min(total(ij) ?? Infinity, total(xy) + risk(ij)));
  queue.enqueueAll(
    ...neighbours(xy)
      .map((ij) => [total(ij), hash(ij)])
      .filter(([, hash]) => !visited.has(hash))
  );
} while (!!queue.size);

console.log(
  'Part I:',
  totals[(HEIGHT / SCALE) - 1][(WIDTH / SCALE) - 1],
);

console.log(
  'Part II:',
  totals[HEIGHT - 1][WIDTH - 1],
);
