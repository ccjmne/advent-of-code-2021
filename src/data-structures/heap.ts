/* eslint-disable no-bitwise */
/* eslint-disable no-plusplus */

import { forSure, Maybe } from 'src/maybe';

const OFFSET_BY_1 = Symbol('Allows the backing Array for Heap<T> to be 1-indexed');

/**
 * @see https://en.wikipedia.org/wiki/Heap_(data_structure)
 */
export default class BinaryHeap<T> {

  /**
   * Contains `OFFSET_BY_1` at index `0` so that the rest of the array is virtually indexed at `1`.
   * Using a 1-indexed Array allows simpler arithemetic, where each element
   * at an index `n` has its parent at `n >> 1`, grandparent at `n >> 2`, etc...
   *
   * Yet `nodes` isn't **typed** as containing `OFFSET_BY_1` (e.g.: `[OFFSET_BY_1, ...T[]]`),
   * because it —conceptually— merely is a 1-indexed Array of `T`.
   */
  private readonly nodes: T[];

  public get size(): number {
    return this.nodes.length - 1;
  }

  /**
   * Creates a Heap using Floyd's algorithm.
   * @see https://en.wikipedia.org/wiki/Binary_heap#Building_a_heap
   */
  constructor(private readonly aOverB: (a: T, b: T) => boolean, items: T[] = []) {
    // eslint-disable-next-line
    // @ts-ignore -- Isn't **typed** as containing `OFFSET_BY_1` for good reason: see comment on member declaration.
    this.nodes = [OFFSET_BY_1, ...items];
    for (let i = this.size >> 1; i >= 1; --i) {
      this.siftDown(i);
    }
  }

  public isEmpty(): boolean {
    return !this.size;
  }

  public peek(): Maybe<T> {
    return this.nodes[1];
  }

  /**
   * Removes the top-priority element from the heap and returns it.
   * Throws an error if the heap is empty.
   *
   * @see BinaryHeap#isEmpty
   */
  public pop(): T {
    if (this.isEmpty()) {
      throw new Error('Attempting to pop from empty heap');
    }

    this.swap(1, this.size);
    const res = forSure(this.nodes.pop());
    this.siftDown(1);
    return res;
  }

  public insert(node: T): void {
    this.siftUp(this.nodes.push(node) - 1);
  }

  private swap(i: number, j: number) {
    const n = this.nodes[i];
    this.nodes[i] = this.nodes[j];
    this.nodes[j] = n;
  }

  private siftUp(at: number): void {
    let i = at;
    let j = i >> 1;
    while (i !== 1 && this.aOverB(this.nodes[i], this.nodes[j])) {
      this.swap(i, j);
      j = (i = j) >> 1;
    }
  }

  /**
   * It looks like it could be wildly simplified, and it indeed could... if we were willing
   * to broaden `aOverB` to accept nil values.
   */
  private siftDown(i: number): void {
    const l = i << 1;
    const r = l + 1;
    let hi = i;

    if (l <= this.size && this.aOverB(this.nodes[l], this.nodes[hi])) {
      hi = l;
    }

    if (r <= this.size && this.aOverB(this.nodes[r], this.nodes[hi])) {
      hi = r;
    }

    if (hi !== i) {
      this.swap(i, hi);
      this.siftDown(hi);
    }
  }

}
