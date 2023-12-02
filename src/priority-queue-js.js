import { sum } from './utils.js'

/** @template { string | number } T */
export default class PriorityQueue {

  /** @type { { [key: number]: Set<T> } } */
  buckets = {}

  /** @type { number[] } */
  priorities = []

  /** @param { ReadonlyArray<[number, T]> } queued */
  constructor(...queued) {
    this.enqueueAll(...queued)
  }

  /** @param { number } priority @param { T } hash */
  enqueue(priority, hash) {
    this.bucket(priority).add(hash)
  }

  /** @param { ReadonlyArray<[number, T]> } queued */
  enqueueAll(...queued) {
    queued.forEach(([priority, hash]) => this.enqueue(priority, hash))
  }

  /** @returns { number } */
  get size() {
    return sum(Object.values(this.buckets), ({ size }) => size)
  }

  /** @param { boolean? } largest @returns { T | null } */
  dequeue(largest = false) {
    const i = largest ? this.priorities.length - 1 : 0
    const b = this.buckets[this.priorities[i]]
    if (!b) {
      return null
    }

    const next = b.values().next().value
    b.delete(next)
    if (!b.size) {
      delete this.buckets[this.priorities[i]]
      this.priorities.splice(i, 1)
    }

    return next
  }

  /** @param { number } priority @param { number? } lo @param { number? } hi @returns { Set<T> } */
  bucket(priority, lo = 0, hi = this.priorities.length) {
    /**
     * Equivalent to `Math.floor((hi + lo) / 2)`
     * because bitwise operations cast `number`s into integers.
     *
     * (That is, if the JIT already hadn't figured these numbers
     * were never used in way that would require to switch to/enable
     * a floating-point format)
     */
    const m = (hi + lo) >> 1
    const p = this.priorities[m]

    if (priority === p) {
      return this.buckets[priority]
    }

    if (lo === hi) {
      this.priorities.splice(lo, 0, priority)
      return (this.buckets[priority] = new Set())
    }

    return priority < p
      ? this.bucket(priority, lo, m)
      : this.bucket(priority, m + 1, hi)
  }

  /**
   * @param { number } priority @returns { Set<T> }
   * @deprecated
   *
   * Alternative implementation that should be significantly
   * faster if JS Arrays were implemented as Linked-Lists.
   */
  bucket_alt(priority) {
    const i = this.priorities.findIndex(p => p >= priority)
    if (this.priorities[i] !== priority) {
      this.priorities.splice(i, 0, priority)
      this.buckets[priority] = new Set()
    }

    return this.buckets[priority]
  }

}
