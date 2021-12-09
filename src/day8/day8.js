'use strict';

import getInput from '../input.js';
import { count, range, sum } from '../utils.js';

const input = getInput(import.meta.url)
  .split(/\n/g)
  .map(line => line.split(/\s+\|\s+/));

// PART I:

console.log(
  'Part I:',
  sum(input.map(([, display]) => count(
    display.split(/\s+/g),
    ({ length }) => [2, 4, 3, 7].includes(length)) // Digits 1, 4, 7 or 8 are of length 2, 4, 3 and 6, respectively
  )),
);

// PART II:

class DigitConfig {
  static displayMap = {
    [[0, 1, 2, 4, 5, 6]]: 0,
    [[2, 5]]: 1,
    [[0, 2, 3, 4, 6]]: 2,
    [[0, 2, 3, 5, 6]]: 3,
    [[1, 2, 3, 5]]: 4,
    [[0, 1, 3, 5, 6]]: 5,
    [[0, 1, 3, 4, 5, 6]]: 6,
    [[0, 2, 5]]: 7,
    [[0, 1, 2, 3, 4, 5, 6]]: 8,
    [[0, 1, 2, 3, 5, 6]]: 9,
  };

  static segCountToSegments = {
    [2]: [2, 5],
    [3]: [0, 2, 5],
    [4]: [1, 2, 3, 5],
    [5]: [0, 3, 6],
    [6]: [0, 1, 5, 6],
    [7]: []
  };

  segments = Array.from({ length: 7 }, () => 'abcdefg');

  /** @param { number } at @returns { number[] } */
  not(at) {
    return range(7).filter(i => i !== at);
  }

  /** @param { number } at @param { string } pattern @returns { void } */
  intersect(at, pattern) {
    const length = this.segments[at].length;
    this.segments[at] = this.segments[at].split('').filter(l => pattern.includes(l)).join('');
    if (length !== this.segments[at].length && this.segments[at].length === 1) {
      this.not(at).forEach(i => this.remove(i, this.segments[at]));
    }
  }

  /** @param { number } at @param { string } pattern @returns { void } */
  remove(at, pattern) {
    const length = this.segments[at].length;
    this.segments[at] = this.segments[at].split('').filter(l => !pattern.includes(l)).join('');
    if (length !== this.segments[at].length && this.segments[at].length === 1) {
      this.not(at).forEach(i => this.remove(i, this.segments[at]));
    }
  }

  /** @param { string[] } patterns */
  constructor(patterns) {
    patterns.forEach(
      pattern => DigitConfig.segCountToSegments[pattern.length].forEach((seg) => this.intersect(seg, pattern))
    );

    if (!this.segments.every(options => options.length === 1)) {
      throw new Error('🙅‍♂️');
    }
  }

  /**
   * @param { [string, string, string, string] } digits
   * @returns { number }
   */
  translate(digits) {
    return Number(digits.map(
      digit => DigitConfig.displayMap[
        digit.split('').map(id => this.segments.indexOf(id)).sort()
      ]
    ).join(''))
  }
}

console.log(
  'Part II:',
  sum(input.map(([patterns, display]) => new DigitConfig(patterns.split(/\s+/g)).translate(display.split(/\s+/)))),
);
