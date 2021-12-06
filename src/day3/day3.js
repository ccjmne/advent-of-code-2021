'use strict';

import getInput from "../input.js";
import { range } from "../utils.js";

const input = getInput(import.meta.url)
  .split(/\n/g)
  .map(word => word.split(/(?<=[01])/).map(Number));

// PART I:
const INPUT_WIDTH = input[0].length;
const INPUT_HEIGHT = input.length;

function gen1() { // decodes ratings of the "generation 1" kind
  return input.reduce(
    (tally, bits) => tally.map((c, i) => c + bits[i]),
    [...Array(INPUT_WIDTH)].fill(0)
  ).map(ones => +(ones >= INPUT_HEIGHT / 2))
}

/** @param { (0 | 1)[] } bits @returns { number } */
function asInt(bits) {
  return parseInt(bits.join(''), 2);
}

console.log(
  'Part I:',
  '\n> Gamma rate:',
  asInt(gen1()),
  '\n> Epsilon rate:',
  asInt(gen1().map(bit => +!bit)),
  '\n> Power consumption:',
  asInt(gen1()) * asInt(gen1().map(bit => +!bit))
);

// PART II:

/**
 * Filters words from `const input` using the specified `selector`, for each bit
 * from left to right, until there's only one word left.
 *
 * `selector` gets called with:
 * - the *most common bit value* at a given position
 * - the *current bit value* at that same position in a given word
 * @param { function(number, number): boolean } selector
 */
function gen2(selector) {
  return asInt(range(INPUT_WIDTH).reduce(
    function (words, at) {
      if(words.length <= 1) {
        return words;
      }

      const mostCommon = +(count(words, (word) => word[at]) >= words.length / 2);
      return words.filter((word, i) => selector(mostCommon, word[at]));
    },
    input
  )[0]);
}

console.log(
  'Part II:',
  '\n> Oxygen generator rating:',
  gen2((mostCommon, bit) => bit === mostCommon),
  '\n> CO2 scrubber rating:',
  gen2((mostCommon, bit) => bit !== mostCommon),
  '\n> Life support rating:',
  gen2((mostCommon, bit) => bit === mostCommon) * gen2((mostCommon, bit) => bit !== mostCommon),
);
