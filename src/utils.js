/**
 * An array of `length` values going from `offset` (inclusive) to `offset + length * step` (exclusive).
 * @param { number } length
 * @param { { offset: number, step: number } } [options]
 * @returns { number[] }
 */
export function range(length, { offset = 0, step = 1 } = {}) {
  return Array.from({ length }, (_, i) => offset + i * step);
}

export const Styles = Object.freeze({ RESET: 0b0000001, BRIGHT: 0b0000010, DIM: 0b0000100, UNDERSCORE: 0b0001000, BLINK: 0b0010000, REVERSE: 0b0100000, HIDDEN: 0b1000000 });
const STYLES_MAP = { [Styles.RESET]: '\x1b[0m', [Styles.BRIGHT]: '\x1b[1m', [Styles.DIM]: '\x1b[2m', [Styles.UNDERSCORE]: '\x1b[4m', [Styles.BLINK]: '\x1b[5m', [Styles.REVERSE]: '\x1b[7m', [Styles.HIDDEN]: '\x1b[8m' };

/**
 * @param { string } text
 * @param { number } styles A combination of flags from `Styles`.
 * For example: `Styles.BRIGHT & Styles.UNDERSCORE`
 * @returns { string }
 */
export function style(text, styles) {
  return Object.entries(STYLES_MAP)
    .filter(([flag]) => !!(styles & flag))
    .map(([, esc]) => esc)
    .join('')
    + text
    + STYLES_MAP[Styles.RESET];
}
