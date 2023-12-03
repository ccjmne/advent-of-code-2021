import { type Stats } from 'fs'

import chokidar from 'chokidar'
import { fromEvent, merge, Observable, share } from 'rxjs'

export default function watch(
  paths: string | readonly string[],
  options?: chokidar.WatchOptions | undefined,
): Observable<[string, Stats]> {
  return new Observable<[string, Stats]>(subscriber => {
    const watcher = chokidar.watch(paths, { ...options, alwaysStat: true, ignoreInitial: true })

    return merge(
      fromEvent(watcher, 'add'),
      fromEvent(watcher, 'change'),
      fromEvent(watcher, 'unlink'),
    ).subscribe(subscriber).add(() => { void watcher.close() })
  }).pipe(share())
}
