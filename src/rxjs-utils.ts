import { Observable, Subject, asapScheduler, observeOn, startWith, type OperatorFunction, defer } from 'rxjs'

export function bufferUntil<T>(predicate: (value: T) => boolean): OperatorFunction<T, T[]> {
  return (source: Observable<T>) => new Observable<T[]>(observer => {
    let buffer: T[] = []

    return source.subscribe({
      next(value) {
        buffer.push(value)

        if (predicate(value)) {
          observer.next(buffer)
          buffer = []
        }
      },
      error(err) { observer.error(err) },
      complete() { observer.complete() },
    })
  })
}

export function echo<T>(kickoff: T, through: (feed: Observable<T>) => Observable<T>): Observable<T> {
  return defer(() => {
    const feed = new Subject<T>()
    through(feed).pipe(startWith(kickoff), observeOn(asapScheduler)).subscribe(feed)

    return feed
  })
}
