import { isObservable, lastValueFrom } from 'rxjs'
import { expose } from 'threads-esm'

import { type SolutionModule } from 'src/solution-module'

type ESModule<T> = { default: T }
export type WorkerModule = { process: (year: number, day: number, part: 'I' | 'II', input: string) => Promise<unknown> }

void expose({
  process(year: number, day: number, part: 'I' | 'II', input: string): Promise<unknown> {
    return (import(`./src/${year}/${day}/${day}.ts#${Math.random()}`) as Promise<ESModule<SolutionModule<unknown>>>)
      .then(({ default: { parse, [`part${part}` as const]: run } }) => run(parse(input)))
      .then(res => (isObservable(res) ? lastValueFrom(res) : res))
  },
} as WorkerModule)
