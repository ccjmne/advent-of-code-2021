'use strict';

import getInput from '../input.js';
import { range } from '../utils.js';

const input = getInput(import.meta.url).split(/\n/g);


function addAsap(value, pair) {
  if (!Array.isArray(pair)) {
    return pair + value;
  }

  return [addAsap(value, pair[0]), pair[1]];
}

function addAlap(value, pair) {
  if (!Array.isArray(pair)) {
    return pair + value;
  }

  return [pair[0], addAlap(value, pair[1])];
}

function equals(a, b) {
  return Array.isArray(a)
    ? Array.isArray(b) && range(a.length).every(i => equals(a[i], b[i]))
    : a === b;
}

function reduce(pair, depth = 0) {
  if (!Array.isArray(pair)) {
    return pair >= 10
    ?
        (console.log('SPLIT!!! ', pair, 'into', [Math.floor(pair / 2), Math.ceil(pair / 2)].join(' & ')),
        Object.assign([Math.floor(pair / 2), Math.ceil(pair / 2)], { split: true }))
      : pair;
  }

  if (Array.isArray(pair) && depth === 4) {
    console.log('EXPLODE!!! ', pair.join(' & '))
    return Object.assign(0, { explode: pair });
  }

  const l = reduce(pair[0], depth + 1);
  if (l.split) {
    return Object.assign([l, pair[1]], { split: true });
  }
  if (l.explode) {
    const [xl, xr] = l.explode;
    // console.log('EXPLODEDDD!!! from the left.', xl, xr)
    delete l.explode;
    return Object.assign([l, addAsap(xr, pair[1])], { explode: [xl, 0] });
  }

  const r = reduce(pair[1], depth + 1);
  if (r.split) {
    return Object.assign([pair[0], r], { split: true });
  }
  if (r.explode) {
    const [xl, xr] = r.explode;
    // console.log('EXPLODEDDD!!! from the right.', xl, xr)
    delete r.explode;
    return Object.assign([addAlap(xl, pair[0]), r], { explode: [0, xr] });
  }

  return Object.assign([l, r], { done: depth === 0  });
}


function reduceSplit(pair, depth = 0) {
  if (!Array.isArray(pair)) {
    return pair >= 10
    ?
        (console.log('SPLIT!!! ', pair, 'into', [Math.floor(pair / 2), Math.ceil(pair / 2)].join(' & ')),
        Object.assign([Math.floor(pair / 2), Math.ceil(pair / 2)], { split: true }))
      : pair;
  }

  const l = reduceSplit(pair[0], depth + 1);
  if (l.split) {
    return Object.assign([l, pair[1]], { split: true });
  }

  const r = reduceSplit(pair[1], depth + 1);
  if (r.split) {
    return Object.assign([pair[0], r], { split: true });
  }

  return Object.assign([l, r], { done: depth === 0  });
}


function reduceExplode(pair, depth = 0) {
 if (!Array.isArray(pair)) {
    return pair;
  }

  if (Array.isArray(pair) && depth === 4) {
    console.log('EXPLODE!!! ', pair.join(' & '))
    return Object.assign(0, { explode: pair });
  }

  const l = reduceExplode(pair[0], depth + 1);
  if (l.explode) {
    const [xl, xr] = l.explode;
    // console.log('EXPLODEDDD!!! from the left.', xl, xr)
    delete l.explode;
    return Object.assign([l, addAsap(xr, pair[1])], { explode: [xl, 0] });
  }

  const r = reduceExplode(pair[1], depth + 1);
  if (r.explode) {
    const [xl, xr] = r.explode;
    // console.log('EXPLODEDDD!!! from the right.', xl, xr)
    delete r.explode;
    return Object.assign([addAlap(xl, pair[0]), r], { explode: [0, xr] });
  }

  return Object.assign([l, r], { done: depth === 0  });
}

function reduce2(pair, depth= 0) {

  let prev, cur = pair;
  do {
    prev = cur;
    cur = reduceExplode(cur)
    console.log('▶ ' + display(cur))
  } while(!equals(cur, prev));

  // do {
  //   prev = cur;
    cur = reduceSplit(cur)
    console.log('▶ ' + display(cur))
  // } while(!equals(cur, prev))

  return cur;
}

function display(pair) {
  return Array.isArray(pair)
    ? `[${display(pair[0])},${display(pair[1])}]`
    : String(pair);
}


function superReduce(asdf) {
  let prev, cur = asdf;
  while(!equals(cur, prev)) {
    prev = cur;
    cur = reduce2(cur)
    // console.log('◀ ' + display(prev))
    // console.log('▶ ' + display(cur))
  }
  return cur;
}

const ns = input.map(eval);

// const ns =[
// [[[0,[4,5]],[0,0]],[[[4,5],[2,6]],[9,5]]],
// [7,[[[3,7],[4,3]],[[6,3],[8,8]]]]
// ];
const ns0 = superReduce(ns[0])

const res = ns.slice(1).reduce((acc, n) => {
  console.log('  ' + display(acc))
  console.log('+ ' + display(n))
  const r =  superReduce([acc, n])
  console.log('= ' + display(r) + '\n')
  return r;
}, ns0)

console.log('----------------')

console.log(display(res))

function magnitude(pair) {
  return Array.isArray(pair)
    ? 3 * magnitude(pair[0]) + 2 * magnitude(pair[1])
    : pair;
}

console.log(magnitude(res))

// console.log(
//   display(
//     superReduce(
//     [[[[0,[4,5]],[0,0]],[[[4,5],[2,6]],[9,5]]],
//  [7,[[[3,7],[4,3]],[[6,3],[8,8]]]]]
//     )
//   )
// )





// PART I: (start: 1639, stop: )

console.log(
  'Part I:',
  1,
);

// PART II: (start: , stop: )

console.log(
  'Part II:',
  2,
);
