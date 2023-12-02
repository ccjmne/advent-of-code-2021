import { readFile } from 'fs/promises'

import { type Observable, Subject, BehaviorSubject, tap, startWith, switchMap, concat, of, from, defer, EMPTY, concatWith, withLatestFrom, map, filter, mergeWith, pairwise, forkJoin, combineLatestWith, catchError } from 'rxjs'
import { type SpawnedWorker, spawn } from 'threads-esm'

import { type SolutionModule } from 'src/solution-module'
import watch from 'tools/watch'

import { type Options } from './io'
import { type WorkerModule } from './worker'

export enum Status {
  RESPAWNING,
  COMPUTING,
  DONE,
  ERROR,
}

type ESModule<T> = { default: T }

export function getResult(
  year: number,
  day: number,
  part: 'partI' | 'partII',
  opts: Observable<Options>,
): Observable<readonly [Status, unknown]> {
  const terminateWorker$ = new Subject<true>()
  const worker$ = new BehaviorSubject<SpawnedWorker<WorkerModule> | null>(null)
  terminateWorker$.pipe(
    tap(() => {
      if (worker$.value !== null) {
        void worker$.value.terminate()
      }
    }),
    startWith(true),
    switchMap(() => concat(of(null), from(spawn<WorkerModule>(new URL('./worker.ts', import.meta.url))))),
  ).subscribe(worker$)

  let first = true

  // Equivalent to `startWith(Symbol('INIT'))` the first time this stream is subscribed to,
  // but not on subsequent subscriptions (i.e.: when recovering from an error)
  return defer(() => (first ? of(Symbol('INIT')).pipe(tap(() => first = false)) : EMPTY)).pipe(
    // on input/code changes, while "run part" is true
    concatWith(watch(`./src/${year}/${day}`)),
    withLatestFrom(opts.pipe(map(({ [part]: runPart }) => runPart))),
    filter(([, runPart]) => runPart),

    // or when "run part" switches from `false` to `true`
    mergeWith(opts.pipe(
      map(({ [part]: runPart }) => runPart),
      pairwise(),
      filter(([prev, cur]) => !prev && cur),
    )),

    // parse input
    switchMap(() => forkJoin([
      from(import(`./src/${year}/${day}/${day}.ts#${Math.random()}`) as Promise<ESModule<SolutionModule<unknown>>>),
      from(readFile(`./src/${year}/${day}/input`).then(buffer => String(buffer).trimEnd())),
    ])),
    map(([{ default: { parse } }, input]) => parse(input)),

    // compute solution
    combineLatestWith(worker$),
    switchMap(([input, worker]) => (worker === null
      ? of([Status.RESPAWNING, 0] as const) // TODO: actually track elapsed time
      : concat(
        of([Status.COMPUTING, 0] as const), // TODO: actually track elapsed time
        from(worker.process(year, day, part, input)).pipe(
          map(result => [Status.DONE, result] as const),
        ),
      )
    )),

    catchError((error, caught) => {
      terminateWorker$.next(true)

      return concat(of([Status.ERROR, error] as const), caught)
    }),
  )
}
