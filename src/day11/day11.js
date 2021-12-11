'use strict';

import getInput from '../input.js';
import { count, range, split, style, Styles } from '../utils.js';

const input = getInput(import.meta.url)
  .split(/\n/g)
  .map(line => line.split('').map(Number));

const consortium = input.flat();
const [width, height] = [input[0].length, input.length];

/** @param { number } i @returns { number[] } */
function neighbours(i) {
  const [x, y] = [i % width, Math.floor(i / width)];
  return [
    [x - 1, y - 1],
    [x - 1, y    ],
    [x - 1, y + 1],
    [x    , y - 1],
 // [x    , y    ],
    [x    , y + 1],
    [x + 1, y - 1],
    [x + 1, y    ],
    [x + 1, y + 1],
  ]
    .filter(([u, v]) => u >= 0 && u < width && v >= 0 && v < height)
    .map(([u, v]) => v * width + u);
}

/** @param { number[] } consortium @returns { [number[], number] } */
function step(consortium) {
  let flashes = 0;
  /** @param { number[] } b @returns { number[] } */
  return [
    (function glow(b) {
      const glowing = count(b, energy => energy > 9);
      flashes += glowing;

      return glowing === 0
        ? b
        : glow(b.map((energy, i) => energy > 9 || energy === 0
            ? 0
            : energy + count(neighbours(i).map(j => b[j]), e => e > 9)
          ));
    }(consortium.map(energy => energy + 1))),
    flashes,
  ];
}

/** @param { number[] } consortium @returns { string } */
function displayConsortium(consortium) {
  return '\n' + split(consortium, width).map(
    line => line.map(energy => style(energy, energy === 0 ? Styles.BRIGHT : Styles.RESET)).join('')
  ).join('\n');
}

// PART I:

/** @param { number[] } consortium @param { number } steps @returns { [number[], number] } */
function iterate(consortium, steps) {
  return range(steps).reduce(
    ([consort, flashes]) => {
      const [c, additionalFlashes] = step(consort);
      return [c, flashes + additionalFlashes];
    },
    [consortium, 0],
  );
}

console.log(
  'Part I:',
  '\n> Flashes:',
  iterate(consortium, 100)[1],
  '\n> Consortium:',
  displayConsortium(iterate(consortium, 100)[0]),
);

// PART II:

/** @param { number[] } consortium @returns { number } */
function synchronise(consortium) {
  let steps = 0;
  let state = consortium;

  while (count(state, energy => energy !== 0) > 0) {
    state = step(state)[0];
    steps++;
  }

  return steps;
}

console.log(
  'Part II:',
  '\n> Synchronised at:',
  synchronise(consortium),
);
