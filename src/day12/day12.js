'use strict';

import getInput from '../input.js';
import { mapValues } from '../utils.js';

/** @type { [string, string][] } */
const input = getInput(import.meta.url)
  .split(/\n/g)
  .map(line => line.split(/-/));

const [START, END] = ['start', 'end'];

/** @type { { [key: string]: string[] } } */
const CONNEXIONS = input.reduce(
  (acc, [a, b]) => ({
    ...acc,
    [a]: (acc[a] ?? []).concat(b),
    [b]: (acc[b] ?? []).concat(a),
  }),
  {}
);

/** @type { { [key: string]: number } } */
const VISITS = {
  ...input.flat().reduce((acc, a) => ({ ...acc, [a]: 0 }), {}),
  [START]: Infinity,
};

/** @param { string } name @returns { boolean } */
function isLarge(name) {
  return /^[A-Z]+$/.test(name);
}

/**
 * @param { { [key: string]: number } } visits
 * @param { string } from
 * @param { string[] } path
 * @param { boolean } mayRevisit
 * @returns { string[][] }
 */
function findPaths(visits, from, path, mayRevisit) {
  if (from === END) {
    return [path];
  }

  return CONNEXIONS[from]
    .filter(next => isLarge(next) || (visits[next] < 1 + +mayRevisit))
    .flatMap(next => findPaths(
      mapValues(visits, (count, name) => count + +(name === next)),
      next,
      [...path, next],
      mayRevisit && (isLarge(next) || visits[next] === 0),
    ));
}

// PART I:

console.log(
  'Part I:',
  findPaths(VISITS, START, [START], false).length,
);

// PART II:

console.log(
  'Part II:',
  findPaths(VISITS, START, [START], true).length,
);
