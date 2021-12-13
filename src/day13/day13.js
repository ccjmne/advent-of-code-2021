'use strict';

import getInput from '../input.js';
import { mapValues, max, range } from '../utils.js';

/** @type { [ [number, number][], { axis: 'x' | 'y', at: number }[] ] } */
const [dots, folds] = (function (input) {
  const [dots, instructions] = input.split(/^$/m).map(line => line.trim().split(/\n/g));
  return [
    dots.map(line => line.split(/,/).map(Number)),
    instructions.map(line => mapValues(
      /(?<axis>[xy])=(?<at>\d+)/.exec(line).groups,
      (k, v) => k === 'at' ? Number(v) : v,
    )),
  ];
}(getInput(import.meta.url)));

const [WIDTH, HEIGHT] = [
  max(dots.map(([x]) => x)) + 1,
  max(dots.map(([, y]) => y)) + 1,
];

/** @param { number } i @returns { [number, number] } */
function xy(i) {
  return [i % WIDTH, Math.floor(i / WIDTH)];
}

/** @param { [number, number] } xy @returns { number } */
function i([x, y]) {
  return y * WIDTH + x;
}

/** @param { Set<number> } dots @param { { axis: 'x' | 'y', at: number } } fold @returns { Set<number> } */
function fold(dots, { axis, at }) {
  return new Set(
    [...dots.values()]
      .map(xy)
      .map(xy => [xy[+(axis !== 'y')], xy[+(axis === 'y')]])
      .map(([keep, change]) => change >= at ? [keep, 2 * at - change] : [keep, change])
      .map(([kept, changed]) => axis === 'y' ? [kept, changed] : [changed, kept])
      .map(i)
  );
}

// PART I: (start: 1646, stop: 1720)

console.log(
  'Part I:',
  fold(dots.map(i), folds[0]).size,
);

// PART II: (start: 1725, stop: 1735)

/** @param { Set<number> } dots @returns { [Set<number>, number, number] } */
function trim(dots) {
  const xys = [...dots.values()].map(xy);
  const [w, h] = [
    max(xys.map(([x]) => x)) + 1,
    max(xys.map(([, y]) => y)) + 1,
  ];

  /** @param { [number, number] } xy @returns { number } */
  function i([x, y]) {
    return y * w + x;
  }

  return [new Set(xys.map(i)), w, h];
}

/** @param { Set<number> } dots @returns { string } */
function drawDots(dots) {
  const [d, w, h] = trim(dots);

  return '\n' + range(h).map(
    y => range(w).map(
      x => d.has(y * w + x) ? '█' : ' '
    ).join('')
  ).join('\n');
}

console.log(
  'Part II:',
  drawDots(folds.reduce(fold, dots.map(i))),
);
