/**
 * An array of integers going from 0 (inclusive) to `size` (exclusive).
 * @param { number } length
 * @returns { number[] }
 */
export function range(length) {
  return Array.from({ length }, (_, i) => i);
}
