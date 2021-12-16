'use strict';

import { sum } from './utils.js';

/** @template { string | number } T */
export default class PriorityQueue {

  /** @type { { [key: number]: Set<T> } } */
  buckets = {};

  /** @type { number[] } */
  priorities = [];

  /** @param { ReadonlyArray<[number, T]> } queued */
  constructor(...queued) {
    this.enqueueAll(...queued);
  }

  /** @param { number } priority @param { T } hash */
  enqueue(priority, hash) {
    this.bucket(priority).add(hash);
  }

  /** @param { ReadonlyArray<[number, T]> } queued */
  enqueueAll(...queued) {
    queued.forEach(([priority, hash]) => this.enqueue(priority, hash));
  }

  /** @returns { number } */
  get size() {
    return sum(Object.values(this.buckets), ({ size }) => size);
  }

  // TODO: implement dequeueing MAX-priority first
  /** @returns { T | null } */
  dequeue() {
    const b = this.buckets[this.priorities[0]];
    if (!b) {
      return null;
    }

    const next = b.values().next().value;
    b.delete(next);
    if (!b.size) {
      delete this.buckets[this.priorities[0]];
      this.priorities.splice(0, 1);
    }

    return next;
  }

  /** @param { number } priority @param { number? } lo @param { number? } hi @returns { Set<number> } */
  bucket(priority, lo = 0, hi = this.priorities.length) {
    const m = Math.floor((hi + lo) / 2);
    const p = this.priorities[m];

    if (priority === p) {
      return this.buckets[priority];
    }

    if (lo === hi) {
      this.priorities.splice(lo, 0, priority);
      return (this.buckets[priority] = new Set());
    }

    return priority < p
      ? this.bucket(priority, lo, m)
      : this.bucket(priority, m + 1, hi);
  }

}
