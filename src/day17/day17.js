'use strict';;
import getInput from '../input.js';
import { mapValues, range, sum } from '../utils.js';

const { x1, y1, x2, y2 } = mapValues(
  /x=(?<x1>-?\d+)\.\.(?<x2>-?\d+), y=(?<y1>-?\d+)\.\.(?<y2>-?\d+)/
    .exec(getInput(import.meta.url))
    .groups,
  Number,
);

// PART I: (start: 1804, stop: 1903)

console.log(
  'Part I:',

  /*================================================================================================*
   *                                          DISCLAIMER                                            *
   * THIS IMPLEMENTATION ONLY WORKS FOR TARGET AREAS THAT ARE AT LEAST PARTIALLY UNDER GROUND LEVEL *
   *================================================================================================*
   *
   * You **will** cross the x-axis (`y === 0`) eventually, because your velocity progression is of the form:
   * ```
   *     n + (n-1) + (n-2) + (n-3) + ... + 3 + 2 + 1
   *   + 0 // you're at your apogee there
   *   - 1 - 2 - 3 - ... - (n-3) - (n-2) - (n-1) - n
   *   // you're back at `y === 0` there
   *   - (n+1) - (n+2) - ... (as much as you want)
   * ```
   * ... where `n` is your starting velocity.
   *
   * You want to land inside the target area, with the greatest (negative) vertical velocity possible,
   * because the fastest you fall, the highest you've been.
   *
   * Therefore, you want the first step after you get back to `y === 0` to make you plunge directly to
   * the outwardmost edge of the target area... that is, cover a distance from `0` to `y1`;
   * thus, with a velocity of `y1` after the having reached back to `y === 0`.
   *
   * The velocity before that point will be precisely the additive reciprocal (the "opposite") of your starting velocity,
   * as demonstrated above, that is: `y1 + 1`.
   *
   * Therefore, your starting velocity must be: `-(y1 + 1)`.
   * That velocity will decrease by one until is it naught, at which point the apogee is reached.
   * Therefore, the apogee simply is:
   * `n + (n-1) + (n-2) + (n-3) + ... + 3 + 2 + 1 + 0`
   * ... where n is `-(y1 + 1).
   *
   * The sum of numbers going from 1 to n is `(n * (n + 1)) / 2`.
   * Subsituting n with `-(y1 + 1)`, we get:
   *   -(y1 + 1) * (-(y1 + 1) + 1) / 2
   *   -(y1 + 1) * (-y1 - 1 + 1)   / 2
   *   -(y1 + 1) * -y1             / 2
   *    (y1 + 1) *  y1             / 2
   */
  '\n• Apogee:',
  y1 * (y1 + 1) / 2,

  /**
   * The initial x-velocity must allow the projectile to reach the target area's x-position, but not further,
   * so as to maximise the number of steps where it can gain altitude.
   *
   * Basically, a steeper slope will grant more altitude.
   * A steeper slope is a larger rise-over-run ratio: we want the smallest x-velocity that will reach the closest
   * edge of the target area.
   *
   * Our x-velocity decreases through drag with each step, the maximum horitontal distance reached by a throw of
   * initial horizontal velocity `n` in these conditions is:
   *
   * ```
   * n + (n-1) + (n-2) + (n-3) + ... + 3 + 2 + 1 + 0
   * ```
   *
   * That distance is `n * (n + 1) / 2`. That distance is `x1`.
   * We need to solve:
   * n * (n + 1) / 2 = x1
   * n^2 + n = 2 * x1
   * n^2 + n - 2 * x1 = 0
   *
   * Refer to solving quadratic equations.
   * a = 1
   * b = 1
   * c = -2 * x1
   *
   * ( -b + sqrt(b^2 - 4ac) ) / 2a
   * ( -1 + sqrt(1 - 4 * (-2 * x1)) ) / 2
   * ( -1 + sqrt(1 - 8 * x1) ) / 2
   * (sqrt(8 * x1 + 1) - 1) / 2
   *
   * Use `Math.ceil` to play with integer values and if need be, reach slightly beyond the closest edge of the target area.
   *
   * Alternatively, lookup the index of the first "triangle number" that is greater or equal to `x1`.
   * See A000217 on the OEIS: https://oeis.org/A000217
   */
  '\n• Initial velocities:', {
    Δx: Math.ceil((Math.sqrt(8 * x1 + 1) - 1) / 2),
    Δy: -y1 - 1
  },
);

/** @param { { x?: number, y?: number, Δx: number, Δy: number } } */
function validate({ x = 0, y = 0, Δx, Δy }) {
  return !(x > x2 || y < y1) && // iff out-of-bounds, return `false`
    // either within-target or recurse
    (x >= x1 && x <= x2 && y >= y1 && y <= y2 || validate({ x: x + Δx, y: y + Δy, Δx: Δx - Math.sign(Δx), Δy: Δy - 1 }));
}

const [[Δx0, Δx1], [Δy0, Δy1]] = [[Math.ceil((Math.sqrt(8 * x1 + 1) - 1) / 2), x2], [y1, -y1 - 1]];

// PART II: (start: 1905, stop: 1917)

console.log(
  '\nPart II:',
  '\n• Valid configurations:',
  sum(range(Δx1 - Δx0 + 1, { offset: Δx0 }).map(
    Δx => range(Δy1 - Δy0 + 1, { offset: Δy0 }).filter(
      Δy => validate({ Δx, Δy })
    ).length
  )),
);
