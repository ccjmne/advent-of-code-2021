'use strict';

import getInput from '../input.js';
import { max, min, sum } from '../utils.js';

const input = getInput(import.meta.url)
  .split('')
  .map(hex => Number(`0x${hex}`))
  .flatMap(dec => [3, 2, 1, 0].map(bit => dec >> bit & 0b0001))
  .join('');

/** @param { string[] } bin @returns { number } */
function int(bin) {
  return Number(`0b${bin}`)
}

class Packet {

  /** @type { number } */
  version;
  /** @type { 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 } */
  type;
  /** @type { Packet[] } */
  children = [];

  /** @type { number } */
  #size = 0;
  /** @type { number? } */
  #value;

  /** @returns { number } */
  eval() {
    const values = this.children.map(p => p.eval());
    const [a, b] = values;

    switch (this.type) {
    case 0:
      return sum(values);
    case 1:
      return values.reduce((product, v) => product * v, 1);
    case 2:
      return min(values);
    case 3:
      return max(values);
    case 4:
      return this.#value;
    case 5:
      return +(a > b)
    case 6:
      return +(a < b)
    case 7:
      return +(a === b);
    }
  }

  /** @returns { string } */
  print() {
    const values =  this.children.map(p => p.print());
    const [a, b] = values;
    switch (this.type) {
    case 0:
      return `(${values.join(' + ')})`;
    case 1:
      return `(${values.join(' * ')})`;
    case 2:
      return `min(${values.join(', ')})`;
    case 3:
      return `max(${values.join(', ')})`;
    case 4:
      return String(this.#value);
    case 5:
      return `+(${a} > ${b})`;
    case 6:
      return `+(${a} < ${b})`;
    case 7:
      return `+(${a} === ${b})`;
    }
  }

  /** @param { string } bits */
  constructor(bits) {
    /** @param { number } length @returns { string } */
    const read = length => {
      this.#size += length;
      const res = bits.slice(0, length);
      bits = bits.slice(length);
      return res;
    }

    this.version = int(read(3));
    this.type = int(read(3));

    if (this.type === 4) { // packet contains literal value
      let buffer = [];
      let last = false;
      while (!last) {
        const [l, ...b] = read(5);
        last = !+l;
        buffer.push(...b);
      }

      this.#value = int(buffer.join(''));
      return;
    }

    if (!int(read(1))) {
      // Reading sub-packets of specified total length
      let remaining = int(read(15));
      while (!!remaining) {
        const child = new Packet(bits);
        this.children.push(child)
        remaining -= read(child.#size).length;
      }

      return;
    }

    // Reading sub-packets of specified total number
    this.children.push(...Array.from({ length: int(read(11)) }, () => {
      const child = new Packet(bits);
      read(child.#size);
      return child;
    }));
  }

}

const packet = new Packet(input);

// PART I: (start: 1809)

console.log(
  'Part I:',
  /** @param { Packet } p @returns { number } */
  (function sumVersions(p) {
    return p.version + sum(p.children, child => sumVersions(child));
  }(packet)),
);

// PART II: (stop: 1856)

console.log(
  'Part II:',
  '\n• Value:', packet.eval(),
  '\n• Evaluated:', eval(`
    const min = (...arr) => arr.reduce((acc, v) => v < acc ? v : acc);
    const max = (...arr) => arr.reduce((acc, v) => v > acc ? v : acc);
    ${packet.print()}`
  ),
  '\n• Expression:\n', packet.print(),
);
