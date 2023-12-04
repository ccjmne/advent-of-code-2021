import { BehaviorSubject, EMPTY, Subject, asapScheduler, catchError, concat, distinctUntilChanged, distinctUntilKeyChanged, filter, from, interval, map, merge, observeOn, of, pairwise, share, shareReplay, startWith, switchMap, tap, withLatestFrom, type Observable } from 'rxjs'
import { spawn, type SpawnedWorker } from 'threads-esm'

import { type Options } from './io'
import watch from './tools/watch'
import { type WorkerModule } from './worker'

export enum Status { RESPAWNING, COMPUTING, DONE, ERROR }
export type WorkerEvent = readonly [status: Status, duration: number, data?: unknown]

function toSeconds([s, ns]: [seconds: number, nanoseconds: number]): number {
  return s + ns / 1_000_000_000
}

export function getResult(
  part: 'partI' | 'partII',
  opt$: Observable<Options>,
  input$: Observable<string>,
): Observable<WorkerEvent> {
  const event$: Subject<readonly [status: Status, data?: unknown]> = new BehaviorSubject([Status.RESPAWNING])
  const respawn$ = new Subject<true>()
  const worker$ = new BehaviorSubject<SpawnedWorker<WorkerModule> | null>(null)

  respawn$.pipe(
    withLatestFrom(worker$),
    filter((([, worker]) => worker !== null)),
    tap(([, worker]) => { void worker!.terminate() }),
    startWith(null),
    switchMap(() => concat(of(null), from(spawn<WorkerModule>(new URL('./worker.ts', import.meta.url))))),
  ).subscribe(worker$)

  /**
   * The `switchMap..merge` below uses an `input` that is strictly *hot*, therefore switching year/day will only trigger
   * a new computation afterwards, when the input has caught up with the new parameters.
   * This should probably be the object of a new `Status` value, which would be similar to `COMPUTING` but would not
   * induce a worker respawn when a new computation is triggered. Maybe something like `PENDING`?
   */
  opt$.pipe( // this first pipe decides when to compute
    distinctUntilChanged(({ [part]: r0, year: y0, day: d0 }, { [part]: r1, year: y1, day: d1 }) => r1 === r0 && y1 === y0 && d1 === d0),

    switchMap(run => (run[part] ? merge(
      // trigger input-based recomputations ASAP *after* having taken into account the new input w/ `withLatestFrom` in the computing pipe
      input$.pipe(observeOn(asapScheduler)),
      watch(`./src/${run.year}/${run.day}/*.ts`),
      // respawn worker on changes to other pars of the codebase, to override module caching
      watch('./src', { ignored: `./src/${run.year}/${run.day}` }).pipe(tap(() => respawn$.next(true))),
    ) : EMPTY)),

    // terminate current worker thread if computation is still ongoing
    withLatestFrom(event$),
    tap(([, [status]]) => {
      if (status === Status.COMPUTING) {
        respawn$.next(true)
      }
    }),

    share({ resetOnRefCountZero: false }), // when recovering from an error, a worker respawn alone shall not be enough to trigger a new computation
  ).pipe( // this second pipe computes the solution
    switchMap(() => worker$), // recompute according to worker status *when computation was forbibly triggered* (i.e. not on resuming after an error)
    withLatestFrom(input$.pipe(shareReplay(1)), opt$), // `replay` in order to still have the input when resubscribing after an error
    switchMap(([worker, input, { year, day }]) => (worker === null
      ? of([Status.RESPAWNING] as const)
      : from(worker.process(year, day, part, input)).pipe(
        map(result => [Status.DONE, result] as const),
        startWith([Status.COMPUTING] as const),
      ))),

    // restart worker thread on error and push ERROR event before resuming
    catchError((error, caught) => {
      respawn$.next(true)

      return concat(of([Status.ERROR, error] as const), caught)
    }),

    distinctUntilKeyChanged(0), // the element at 0 is the status
  ).subscribe(event$)

  return event$.pipe(
    startWith([Status.RESPAWNING]),
    map(([status, data]) => [status, process.hrtime(), data] as const),
    pairwise(),
    // if DONE or ERROR, compute elapsed time since previous event; otherwise, compute elapsed time in the current state
    map(([[, start], [status, at, data]]) => [status, [Status.DONE, Status.ERROR].includes(status) ? start : at, data] as const),
    switchMap(([status, start, data]) => ([Status.RESPAWNING, Status.COMPUTING].includes(status) ? interval(47) : EMPTY).pipe(
      startWith(null),
      map(() => [status, toSeconds(process.hrtime(start)), data] as const),
    )),
  )
}
