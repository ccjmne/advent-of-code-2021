import { formatWithOptions } from 'util'

import colours, { type Color } from '@colors/colors'
import { BehaviorSubject, filter, map, take, withLatestFrom, type Observable } from 'rxjs'

import { Status, type WorkerEvent } from './do-run'
import Prompt from './tools/prompt'

const { bold, yellow, red, green, blue, white, grey } = colours
export type Options = { input: boolean, partI: boolean, partII: boolean }

// TODO: Should only be used in here
export function getPrompt(): Prompt {
  const prompt = Prompt.register('')
  prompt.keyPresse$.pipe(
    filter(({ name, ctrl }) => name === 'q' || (ctrl && name === 'c')),
    take(1),
  ).subscribe(() => process.exit(0))

  return prompt
}

// TODO: should call getPrompt itself
export function listen(prompt: Prompt): Observable<Options> {
  const opts = new BehaviorSubject<Options>({ input: true, partI: true, partII: true })

  prompt.keyPresse$.pipe(
    withLatestFrom(opts),
    map(([{ name }, { input, partI, partII }]) => ({
      input,
      partI,
      partII,
      ...{ 1: { partI: !partI }, 2: { partII: !partII }, t: { input: !input } }[name],
    })),
  ).subscribe(opts)

  opts.subscribe(() => prompt.refresh(
    `\n${grey('─'.repeat(process.stdout.columns))}\nPress `
    + `[${blue('t')}]: switch ${('input')}, `
    + `[${blue('1')}|${blue('2')}]: toggle ${('part I')} or ${('II')}, `
    + `[${blue('q')}]: quit`,
  ))

  return opts.asObservable()
}

function makeHeader(year: number, day: number, input: boolean): string {
  const [top, bottom] = [[green('✦'), '❖', red('─'), '─'], ['❖', green('✦'), '─', red('─')]]
  const source = input ? 'personalised' : 'test'

  return `┌${top.join('').repeat(2)}❄${[...top].reverse().join('').repeat(2)}┐\n`
  + `${green('│')} AoC ${bold(String(year))}${' '.repeat(3 - String(day).length)}day ${bold(String(day))} ${green('│')}${' '.repeat(23 - source.length)}${grey(`> using ${white(source)} input <`)}\n`
  + `└${bottom.join('').repeat(2)}✦${[...bottom].reverse().join('').repeat(2)}┘`
}

function makeTitleBar(title: string, [status, elapsed]: WorkerEvent): string {
  const [info, preposition, colour] = {
    [Status.RESPAWNING]: ['respawning', 'for', grey],
    [Status.COMPUTING]: ['computing', 'for', yellow],
    [Status.DONE]: ['done', 'in', green],
    [Status.ERROR]: ['failed', 'after', red],
  }[status] as [string, string, Color]

  return colour(`\n${title
  } ${'─'.repeat(50 - title.length - info.length - preposition.length - elapsed.toFixed(3).length)}┤ ${
    white(`${info} ${grey(preposition)} ${elapsed.toFixed(3)}s`)
  } ├${'─'.repeat(process.stdout.columns - 50 - 8)}`)
}

function getPartOutput([status,, data]: WorkerEvent): unknown | unknown[] {
  return {
    [Status.RESPAWNING]: grey('...'),
    [Status.COMPUTING]: grey('...'),
    [Status.DONE]: data,
    [Status.ERROR]: data,
  }[status]
}

export function printSolution(year: number, day: number, input: boolean, I: WorkerEvent, II: WorkerEvent, runI: boolean, runII: boolean): void {
  // eslint-disable-next-line no-console
  console.log([ // buffer output to avoid jumpy prompt
    '\u001Bc', // clear screen
    makeHeader(year, day, input),
    ...(runI ? [makeTitleBar('Part I', I), formatWithOptions({ colors: true }, ...[getPartOutput(I)].flat())] : []),
    ...(runII ? [makeTitleBar('Part II', II), formatWithOptions({ colors: true }, ...[getPartOutput(II)].flat())] : []),
  ].join('\n'))
}
