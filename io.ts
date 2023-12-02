import { formatWithOptions } from 'util'

import colours, { type Color } from '@colors/colors'
import { BehaviorSubject, filter, map, take, withLatestFrom, type Observable } from 'rxjs'

import { Status, type WorkerEvent } from './do-run'
import Prompt from './tools/prompt'

const { bold, dim, yellow, red, green, blue, white } = colours
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

  opts.subscribe(({ input, partI, partII }) => prompt.refresh(
    `\n${dim('─'.repeat(process.stdout.columns))}\nPress `
    + `[${blue('t')}]: use ${colours.bold(input ? 'test' : 'real')} input, `
    + `[${blue('1')}]: ${colours.bold(partI ? 'disable' : 'enable')} part I, `
    + `[${blue('2')}]: ${colours.bold(partII ? 'disable' : 'enable')} part II, `
    + `[${blue('q')}]: quit`,
  ))

  return opts.asObservable()
}

function makeHeader(year: number, day: number): string {
  const [top, bottom] = [[green('✦'), '❖', red('─'), '─'], ['❖', green('✦'), '─', red('─')]]
  return `┌${top.join('').repeat(2)}❄${[...top].reverse().join('').repeat(2)}┐\n`
  + `${green('│')} AoC ${bold(String(year))}${' '.repeat(3 - String(day).length)}day ${bold(String(day))} ${green('│')}\n`
  + `└${bottom.join('').repeat(2)}✦${[...bottom].reverse().join('').repeat(2)}┘`
}

function makeTitleBar(title: string, [status, elapsed]: WorkerEvent): string {
  const [info, preposition, colour] = {
    [Status.RESPAWNING]: ['respawning', 'for', dim],
    [Status.COMPUTING]: ['computing', 'for', yellow],
    [Status.DONE]: ['done', 'in', green],
    [Status.ERROR]: ['failed', 'after', red],
  }[status] as [string, string, Color]

  return colour(`\n${title
  } ${'─'.repeat(30 - title.length - info.length - preposition.length - elapsed.toFixed(3).length)}┤ ${
    white(`${info} ${dim(preposition)} ${elapsed.toFixed(3)}s`)
  } ├${'─'.repeat(process.stdout.columns - 30 - 8)}`)
}

function getPartOutput([status,, data]: WorkerEvent): unknown | unknown[] {
  return {
    [Status.RESPAWNING]: dim('...'),
    [Status.COMPUTING]: dim('...'),
    [Status.DONE]: data,
    [Status.ERROR]: data,
  }[status]
}

export function printSolution(year: number, day: number, I: WorkerEvent, II: WorkerEvent, runI: boolean, runII: boolean): void {
  // eslint-disable-next-line no-console
  console.log([ // buffer output to avoid jumpy prompt
    '\u001Bc', // clear screen
    makeHeader(year, day),
    ...(runI ? [makeTitleBar('Part I', I), formatWithOptions({ colors: true }, ...[getPartOutput(I)].flat())] : []),
    ...(runII ? [makeTitleBar('Part II', II), formatWithOptions({ colors: true }, ...[getPartOutput(II)].flat())] : []),
  ].join('\n'))
}
