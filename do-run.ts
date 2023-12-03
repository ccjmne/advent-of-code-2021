import { BehaviorSubject, EMPTY, Subject, asapScheduler, catchError, combineLatestWith, concat, distinctUntilChanged, distinctUntilKeyChanged, filter, from, interval, map, merge, observeOn, of, pairwise, share, startWith, switchMap, tap, withLatestFrom, type Observable } from 'rxjs'
import { spawn, type SpawnedWorker } from 'threads-esm'

import watch from './tools/watch'
import { type WorkerModule } from './worker'

export enum Status { RESPAWNING, COMPUTING, DONE, ERROR }
export type WorkerEvent = readonly [status: Status, duration: number, data?: unknown]

function toSeconds([s, ns]: [seconds: number, nanoseconds: number]): number {
  return s + ns / 1_000_000_000
}

export function getResult(
  year: number,
  day: number,
  part: 'partI' | 'partII',
  run$: Observable<boolean>,
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

  run$.pipe( // this first pipe decides when to compute
    distinctUntilChanged(),

    switchMap(run => (run ? merge(
      // trigger input-based recomputations ASAP *after* having taken into account the new input w/ `withLatestFrom` in the computing pipe
      input$.pipe(observeOn(asapScheduler)),
      watch(`./src/${year}/${day}/*.ts`),
      // respawn worker on changes to other pars of the codebase, to override module caching
      watch('./src', { ignored: `./src/${year}/${day}` }).pipe(tap(() => respawn$.next(true))),
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
    combineLatestWith(worker$), // recompute when worker respawns
    withLatestFrom(input$),
    switchMap(([[, worker], input]) => (worker === null
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
