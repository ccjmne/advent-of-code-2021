'use strict';

import getInput from '../input.js';

const input = getInput(import.meta.url)
  .split(/\n/g)
  .map(line => /(?<cmd>forward|down|up)\s+(?<value>\d+)/.exec(line).groups)
  .map(({ cmd, value }) => ({ cmd, value: parseInt(value)}));

// PART I:
console.log(
  'Part I:',
  (function result({ y, z }) {
    return y * z;
  }(input
    .map(({ cmd, value }) => ({
      axis: cmd === 'forward' ? 'y' : 'z',
      value: cmd === 'up' ? -value : value,
    }))
    .reduce((axes, { axis, value }) => ({
      ...axes,
      [axis]: axes[axis] + value
    }), { y: 0, z: 0 }) // axes `y` and `z` are longitudinal and vertical (depth), respectively
  ))
);

// PART II:
console.log(
  'Part II:',
  (function result({ y, z }) {
    return y * z;
  }(input
    .reduce(({ y, z, aim }, { cmd, value }) => ({
      y, z, aim, ...(cmd === 'forward'
        ? { y: y + value, z: z + value * aim }
        : { aim: aim + (cmd === 'up' ? -value : value) }
      )
    }), { y: 0, z: 0, aim: 0 }) // axes `y` and `z` are longitudinal and vertical (depth), respectively
  ))
);
