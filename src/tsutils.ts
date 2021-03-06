import { isNotNil, Maybe } from './maybe';

export function range(length: number, { offset = 0, step = 1 }: { offset?: number, step?: number } = {}): number[] {
  return Array.from({ length }, (_, i) => offset + i * step);
}

export function identity<T, U = T>(t: T): U {
  return t as unknown as U;
}

export function sum<T>(items: T[], by: (item: T) => number): number;
export function sum<T extends number>(items: T[], by?: (item: T) => number): number;
export function sum<T>(items: T[], by: (item: T) => number = identity): number {
  return items.reduce((total, item) => total + by(item), 0);
}

export function split<T, U = T[]>(items: T[], chunkSize: number, mapper: (chunk: T[]) => U = identity): U[] {
  return items.reduce(
    ({ chunks, buffer }: { chunks: U[], buffer: T[] }, item: T) => (buffer.push(item) && (buffer.length === chunkSize)
      ? { chunks: [...chunks, mapper(buffer)], buffer: [] }
      : { chunks, buffer }),
    { chunks: [], buffer: [] },
  ).chunks;
}

export function mapValues<V, W>(object: Record<string, V>, by: (value: V, key: string) => W): Record<string, W> {
  return Object.fromEntries(
    Object.entries(object).map(([k, v]) => [k, by(v, k)]),
  );
}

export function aggregate<T, V = T[]>(
  items: T[],
  by: (item: T) => string = identity,
  aggregator: (aggregated: T[]) => V = identity,
): Record<string, V> {
  return mapValues(
    items.reduce(
      (acc, item) => ({ ...acc, [by(item)]: [...(acc[by(item)] ?? []), item] }),
      {},
    ),
    aggregator,
  );
}

export function occurrences<T>(
  items: T[],
  by: (item: T) => string = identity,
): Record<string, number> {
  return aggregate(items, by, ({ length }) => length);
}

export function select<T>(items: T[], selector: (a: T, b: T) => T): T {
  return items.reduce((most, item) => selector(most, item));
}

export function min(values: number[]): number {
  return select(values, (a, b) => (b < a ? b : a));
}

export function max(values: number[]): number {
  return select(values, (a, b) => (b > a ? b : a));
}

export function count<T>(items: T[], when: (item: T) => boolean): number {
  return items.reduce((total, item) => total + +when(item), 0);
}

export function mapFind<T, R>(items: T[], map: (t: T) => R, find: (r: R) => boolean = isNotNil): Maybe<R> {
  return items.reduce((r, t) => r ?? (rt => (find(rt) ? rt : null))(map(t)), null);
}

/* eslint-disable max-len */
export const Styles = Object.freeze({ BLACK: 1, RED: 2, GREEN: 4, YELLOW: 8, BLUE: 16, MAGENTA: 32, CYAN: 64, WHITE: 128, RESET: 256, BRIGHT: 512, DIM: 1024, UNDERSCORE: 2048, BLINK: 4096, REVERSE: 8192, HIDDEN: 16384 });
const STYLES_MAP = { [Styles.BLACK]: '\x1b[30m', [Styles.RED]: '\x1b[31m', [Styles.GREEN]: '\x1b[32m', [Styles.YELLOW]: '\x1b[33m', [Styles.BLUE]: '\x1b[34m', [Styles.MAGENTA]: '\x1b[35m', [Styles.CYAN]: '\x1b[36m', [Styles.WHITE]: '\x1b[37m', [Styles.RESET]: '\x1b[0m', [Styles.BRIGHT]: '\x1b[1m', [Styles.DIM]: '\x1b[2m', [Styles.UNDERSCORE]: '\x1b[4m', [Styles.BLINK]: '\x1b[5m', [Styles.REVERSE]: '\x1b[7m', [Styles.HIDDEN]: '\x1b[8m' };
/* eslint-enable max-len */

/**
 * @param { string } text
 * @param { number } styles A combination of flags from `Styles`. For example:
 * ```
 * Styles.BRIGHT | Styles.UNDERSCORE
 * ```
 * @returns { string }
 */
export function style(text: string, styles: number): string {
  return Object.entries(STYLES_MAP)
    .filter(([flag]) => !!(styles & +flag)) // eslint-disable-line no-bitwise
    .map(([, esc]) => esc)
    .join('')
    + text
    + STYLES_MAP[Styles.RESET];
}
