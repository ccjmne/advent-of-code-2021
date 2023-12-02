import { BehaviorSubject, EMPTY, Subject, catchError, combineLatestWith, concat, filter, from, interval, map, mergeWith, of, pairwise, share, startWith, switchMap, tap, withLatestFrom, type Observable } from 'rxjs'
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
  const worker$ = new Subject<SpawnedWorker<WorkerModule> | null>()

  respawn$.pipe(
    withLatestFrom(worker$),
    filter((([, worker]) => worker !== null)),
    tap(([, worker]) => { void worker!.terminate() }),
    startWith(true),
    switchMap(() => concat(of(null), from(spawn<WorkerModule>(new URL('./worker.ts', import.meta.url))))),
  ).subscribe(worker$)

  of(null).pipe(
    share({ resetOnComplete: false }), // no initial event on subsequent subscriptions, i.e. when recovering from an error
  ).pipe( // no more than 9 operators per pipe before losing type inference
    // on code changes, while "run part" is true
    mergeWith(
      watch(`./src/${year}/${day}/*.ts`),
      // respawn worker on changes to other pars of the codebase, to override module caching
      watch('./src', { ignored: `./src/${year}/${day}` }).pipe(tap(() => respawn$.next(true))),
    ),
    withLatestFrom(run$),
    filter(([, runPart]) => runPart),

    // or when "run part" switches from `false` to `true`
    mergeWith(run$.pipe(
      pairwise(),
      filter(([prev, cur]) => !prev && cur),
    )),

    // terminate current worker thread if computation is still ongoing
    withLatestFrom(event$),
    tap(([, [status]]) => {
      if (status === Status.COMPUTING) {
        respawn$.next(true)
      }
    }),

    // compute solution
    combineLatestWith(worker$, input$),
    switchMap(([, worker, input]) => (worker === null
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
