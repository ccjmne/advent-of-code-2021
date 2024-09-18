import { forSure } from 'src/maybe';
import { identity } from 'src/tsutils';

import BinaryHeap from './heap';

export enum Priority { ASC = -1, DESC = 1 }
export class PriorityQueue<Hash extends string | number, T = Hash> {

  private heap: BinaryHeap<T>;
  private priorities: Map<Hash, number> = new Map();

  constructor(private readonly hash: (item: T) => Hash = identity, priority: Priority = Priority.DESC) {
    this.heap = new BinaryHeap(
      (a: T, b: T) => ((this.priorities.get(hash(a)) ?? -Infinity) - (this.priorities.get(hash(b)) ?? Infinity)) * priority > 0,
    );
  }

  public get size(): number {
    return this.heap.size;
  }

  public isEmpty(): boolean {
    return this.heap.isEmpty();
  }

  public enqueue(item: T, priority: number): void {
    this.priorities.set(this.hash(item), priority);
    this.heap.insert(item);
  }

  public dequeue(): T {
    const next = this.heap.pop();
    this.priorities.delete(this.hash(next));
    return next;
  }

  public dequeueWithPriority(): [T, number] {
    const next = this.heap.pop();
    const h = this.hash(next);
    const priority = forSure(this.priorities.get(h));
    this.priorities.delete(h);
    return [next, priority];
  }

}
