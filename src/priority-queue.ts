export default class PriorityQueue<T extends string | number> {

  private buckets: Record<number, Set<T>> = {}

  private priorities: number[] = []

  private pSize: number
  public get size(): number {
    return this.pSize
  }

  constructor(...queued: ReadonlyArray<[number, T]>) {
    this.enqueueAll(...queued)
    this.pSize = queued.length
  }

  public enqueue(priority: number, hash: T): void {
    this.bucket(priority).add(hash)
    this.pSize += 1
  }

  public enqueueAll(...queued: ReadonlyArray<[number, T]>): void {
    queued.forEach(([priority, hash]) => this.enqueue(priority, hash))
    this.pSize += queued.length
  }

  public dequeue(largest = false): [number, T] {
    if (!this.size) {
      throw new Error('This queue is empty')
    }

    const i = largest ? this.priorities.length - 1 : 0
    const priority = this.priorities[i]
    const bucket = this.buckets[priority]
    const next = bucket.values().next().value as T
    bucket.delete(next)
    this.pSize -= 1
    if (!bucket.size) {
      delete this.buckets[this.priorities[i]]
      this.priorities.splice(i, 1)
    }

    return [priority, next]
  }

  private bucket(priority: number, lo = 0, hi: number = this.priorities.length): Set<T> {
    /**
     * Equivalent to `Math.floor((hi + lo) / 2)`
     * because bitwise operations cast `number`s into integers.
     *
     * (That is, if the JIT already hadn't figured these numbers
     * were never used in way that would require to switch to/enable
     * a floating-point format)
     */
    const m = (hi + lo) >> 1 // eslint-disable-line no-bitwise
    const p = this.priorities[m]

    if (priority === p) {
      return this.buckets[priority]
    }

    if (lo === hi) {
      this.priorities.splice(lo, 0, priority)
      return (this.buckets[priority] = new Set()) // eslint-disable-line no-return-assign
    }

    return priority < p
      ? this.bucket(priority, lo, m)
      : this.bucket(priority, m + 1, hi)
  }

  /**
   * @deprecated
   *
   * Alternative implementation that should be significantly
   * faster if JS Arrays were implemented as Linked-Lists.
   */
  private bucket_alt(priority: number): Set<T> {
    const i = this.priorities.findIndex(p => p >= priority)
    if (this.priorities[i] !== priority) {
      this.priorities.splice(i, 0, priority)
      this.buckets[priority] = new Set()
    }

    return this.buckets[priority]
  }

}
