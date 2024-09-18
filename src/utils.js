/**
 * An array of `length` values going from `offset` (inclusive) to `offset + length * step` (exclusive).
 * @param { number } length
 * @param { { offset: number, step: number } } [options]
 * @returns { number[] }
 */
export function range(length, { offset = 0, step = 1 } = {}) {
  return Array.from({ length }, (_, i) => offset + i * step);
}

/**
 * @template T
 * @param { T[] } items
 * @param { function(T): number } [by=identity]
 * @returns { number }
 */
export function sum(items, by = identity) {
  return items.reduce((total, item) => total + by(item), 0);
}

/**
 * @template K
 * @template V
 * @template W
 * @param { { [key in K]: V } } object
 * @param { function(V, K): W } by
 * @returns { { [key in K]: W } }
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function mapValues(object, by) {
  return Object.fromEntries(
    Object.entries(object).map(([k, v]) => [k, by(v, k)]),
  );
}

/**
 * @template T
 * @template [K = T]
 * @template [V = T[]]
 * @param { T[] } items
 * @param { function(T): K } [by=identity]
 * @param { function(T[], K): V } [aggregator=identity]
 * @returns { { [key in K]: V } }
 */
export function aggregate(items, by = identity, aggregator = identity) {
  return mapValues(
    items.reduce(
      (acc, item) => ({ ...acc, [by(item)]: [...(acc[by(item)] ?? []), item] }),
      {},
    ),
    aggregator,
  );
}

/**
 * @template T
 * @template K
 * @param { T[] } items
 * @param { function(T): K } [by=identity]
 * @returns { { [key in K]: number } }
 */
export function occurrences(items, by = identity) {
  return aggregate(items, by, ({ length }) => length);
}

/**
 * @template T
 * @param { T[] } items
 * @param { function(T, T): T } selector
 * @returns { T }
 */
export function select(items, selector) {
  return items.reduce((most, item) => selector(most, item));
}

/** @param { number[] } values @returns { number } */
export function min(values) {
  return select(values, (a, b) => (b < a ? b : a));
}

/** @param { number[] } values @returns { number } */
export function max(values) {
  return select(values, (a, b) => (b > a ? b : a));
}

/**
 * @template T
 * @param { T[] } items
 * @param { function(T): boolean } when
 * @return { number }
 */
export function count(items, when) {
  return items.reduce((total, item) => total + +when(item), 0);
}

export const Styles = Object.freeze({ BLACK: 1, RED: 2, GREEN: 4, YELLOW: 8, BLUE: 16, MAGENTA: 32, CYAN: 64, WHITE: 128, RESET: 256, BRIGHT: 512, DIM: 1024, UNDERSCORE: 2048, BLINK: 4096, REVERSE: 8192, HIDDEN: 16384 });
const STYLES_MAP = { [Styles.BLACK]: '\x1b[30m', [Styles.RED]: '\x1b[31m', [Styles.GREEN]: '\x1b[32m', [Styles.YELLOW]: '\x1b[33m', [Styles.BLUE]: '\x1b[34m', [Styles.MAGENTA]: '\x1b[35m', [Styles.CYAN]: '\x1b[36m', [Styles.WHITE]: '\x1b[37m', [Styles.RESET]: '\x1b[0m', [Styles.BRIGHT]: '\x1b[1m', [Styles.DIM]: '\x1b[2m', [Styles.UNDERSCORE]: '\x1b[4m', [Styles.BLINK]: '\x1b[5m', [Styles.REVERSE]: '\x1b[7m', [Styles.HIDDEN]: '\x1b[8m' };

/**
 * @param { string } text
 * @param { number } styles A combination of flags from `Styles`. For example:
 * ```
 * Styles.BRIGHT | Styles.UNDERSCORE
 * ```
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

/** @template T @param { T } t @returns { T } */
export function identity(t) {
  return t;
}

/**
 * See https://stackoverflow.com/q/70237167/2427596
 * @template T
 * @template [U = T[]]
 * @param { T[] } items
 * @param { number } chunkSize
 * @param { function(T[]): U } [mapper = identity]
 * @returns { U[] }
 */
export function split(items, chunkSize, mapper = identity) {
  return items.reduce(
    /** @param { { chunks: U[], buffer: T[] } } acc @param { T } item */
    ({ chunks, buffer }, item) => (buffer.push(item) && (buffer.length === chunkSize)
      ? { chunks: [...chunks, mapper(buffer)], buffer: [] }
      : { chunks, buffer }),
    { chunks: [], buffer: [] },
  ).chunks;
}
