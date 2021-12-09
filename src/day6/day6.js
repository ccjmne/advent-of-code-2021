'use strict';

import getInput from '../input.js';
import { count, range, sum } from '../utils.js';

const input = getInput(import.meta.url)
  .split(/,/g)
  .map(Number);

const SPAWN_CYCLE = 7;     // Each mature lanternfish spawns a new one every 7 days
const MATURITY_PERIOD = 2; // A newly-spawned lanternfish takes 2 days to become mature

// PART I:

/**
 * @param { number [] } population
 * @param { number } period
 * @returns { number[] }
 */
function simulate(population, period) {
  if (period === 0) {
    return population;
  }

  return simulate(
    population.flatMap(fish => fish === 0
      ? [SPAWN_CYCLE - 1, SPAWN_CYCLE + MATURITY_PERIOD - 1]
      : [fish - 1]
    ),
    period - 1
  );
}

console.log(
  'Part I:',
  '\n> After 80 days:', simulate(input.slice(0), 80).length,
);

// PART II:

function simulateV2(period) {
  return sum(range(period).reduce(
    ([due, ...currentGen]) => {
      const nextGen = [...currentGen, due];
      nextGen[SPAWN_CYCLE - 1] += due;
      return nextGen;
    },
    range(SPAWN_CYCLE + MATURITY_PERIOD).map(cycle => count(input, fish => fish === cycle))
  ));
}

console.log(
  'Part II:',
  '\n> After 256 days:', simulateV2(256),
);
