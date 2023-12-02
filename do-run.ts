import { BehaviorSubject, EMPTY, Subject, catchError, combineLatestWith, concat, defer, distinctUntilChanged, filter, from, interval, map, mergeWith, of, pairwise, startWith, switchMap, tap, withLatestFrom, type Observable } from 'rxjs'
import { spawn, type SpawnedWorker } from 'threads-esm'

import { type SolutionModule } from 'src/solution-module'

import { type Options } from './io'
import watch from './tools/watch'
import { type WorkerModule } from './worker'

export enum Status {
  RESPAWNING,
  COMPUTING,
  DONE,
  ERROR,
}

type ESModule<T> = { default: T }
export type WorkerEvent = readonly [status: Status, duration: number, data?: unknown]

function toSeconds([s, ns]: [seconds: number, nanoseconds: number]): number {
  return (s + ns / 1_000_000_000)
}

export function getResult(
  year: number,
  day: number,
  part: 'partI' | 'partII',
  opts: Observable<Options>,
  input$: Observable<string>,
): Observable<WorkerEvent> {
  const event$: Subject<readonly [status: Status, data?: unknown]> = new BehaviorSubject([Status.DONE])
  const terminateWorker$ = new Subject<true>()
  const worker$ = new Subject<SpawnedWorker<WorkerModule> | null>()

  terminateWorker$.pipe(
    withLatestFrom(worker$),
    filter((([, worker]) => worker !== null)),
    tap(([, worker]) => { void worker!.terminate() }),
    startWith(true),
    switchMap(() => concat(of(null), from(spawn<WorkerModule>(new URL('./worker.ts', import.meta.url))))),
  ).subscribe(worker$)

  let first = true

  // Equivalent to `startWith(Symbol('INIT'))` the first time this stream is subscribed to,
  // but not on subsequent subscriptions (i.e.: when recovering from an error)
  defer(() => (first ? of(Symbol('INIT')).pipe(tap(() => first = false)) : EMPTY)).pipe(
    // OLD: on input/code changes, while "run part" is true
    // on code changes, while "run part" is true
    mergeWith(
      watch(`./src/${year}/${day}/*.ts`),
      // respawn worker on changes to other pars of the codebase, to override module caching
      watch('./src', { ignored: `./src/${year}/${day}` }).pipe(tap(() => terminateWorker$.next(true))),
    ),
    withLatestFrom(opts.pipe(map(({ [part]: runPart }) => runPart))),
    filter(([, runPart]) => runPart),

    // or when "run part" switches from `false` to `true`
    mergeWith(opts.pipe(
      map(({ [part]: runPart }) => runPart),
      pairwise(),
      filter(([prev, cur]) => !prev && cur),
    )),

    // terminate ongoing computation if necessary
    withLatestFrom(event$),
    tap(([, [status]]) => {
      if (status === Status.COMPUTING) {
        terminateWorker$.next(true)
      }
    }),

    // compute solution
    combineLatestWith(worker$, input$),
    switchMap(([, worker, input]) => (worker === null
      ? of([Status.RESPAWNING] as const)
      : concat(
        of([Status.COMPUTING] as const),
        // attempt to import the solution so as to obtain properly formatted diagnostics in case of errors
        // TODO: is that necessary?!
        from(import(`./src/${year}/${day}/${day}.ts#${Math.random()}`) as Promise<ESModule<SolutionModule<unknown>>>).pipe(
          switchMap(() => EMPTY),
        ),
        from(worker.process(year, day, part, input)).pipe(
          map(result => [Status.DONE, result] as const),
        ),
      )
    )),

    distinctUntilChanged(([prev], [cur]) => prev === cur),

    catchError((error, caught) => {
      terminateWorker$.next(true)

      return concat(of([Status.ERROR, error] as const), caught)
    }),
  ).subscribe(event$)

  return event$.pipe(
    // add elapsed time info
    map(([status, data]) => [status, process.hrtime(), data] as const),
    pairwise(),
    map(([[, start], [status, at, data]]) => [status, [Status.DONE, Status.ERROR].includes(status) ? start : at, data] as const),
    switchMap(([status, start, data]) => ([Status.RESPAWNING, Status.COMPUTING].includes(status)
      ? interval(47).pipe(startWith(0))
      : of(0)
    ).pipe(map(() => [status, toSeconds(process.hrtime(start)), data] as const))),
  )
}
