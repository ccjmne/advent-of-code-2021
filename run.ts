#!/usr/bin/env ts-node

// Can use with ./run.ts once this is fixed:
// https://github.com/TypeStrong/ts-node/issues/1514

import { readFile, writeFile } from 'fs/promises'

import { catchError, combineLatest, combineLatestWith, concatMap, defer, distinctUntilChanged, finalize, from, identity, map, of, share, startWith, switchMap, takeWhile, type Observable } from 'rxjs'
import yargs from 'yargs'

import { Status, getResult } from './do-run'
import { getPrompt, listen, printSolution } from './io'

import watchFile from './tools/watch'

const { year: y, day: d, watch } = await yargs(process.argv)
  .option('day', {
    type: 'number',
    required: true,
    alias: 'd',
    default: new Date().getDate(),
  })
  .option('year', {
    type: 'number',
    required: true,
    alias: 'y',
    default: new Date().getFullYear(),
  })
  .options('watch', {
    type: 'boolean',
    default: false,
  })
  .help(false)
  .version(false).argv

const prompt = getPrompt()
const opts = listen(prompt, { input: true, I: true, II: true, year: y, day: d })

function downloadInput(year: number, day: number): Observable<string> {
  // return from(fetch(`https://echo.free.beeceptor.com/?year=${year}&day=${day}`, {
  return from(fetch(`https://adventofcode.com/${year}/day/${day}/input`, {
    headers: { cookie: `session=${process.env.AOC_SESSION_COOKIE!}` }, // TODO: make sure AOC_SESSION_COOKIE exists
  }).then(res => res.text())).pipe(
    catchError(() => of('ERROR')),
  )
}

function getTestInput(year: number, day: number): Observable<Buffer> {
  // defer in order to re-attempt reading the file when resubscribing as an attempt to recover from an error
  return defer(() => from(readFile(`./src/${year}/${day}/test-input`))).pipe(
    catchError((_, caught) => prompt.stdinLineByLine('What\'s the test input?').pipe(
      switchMap(input => writeFile(`./src/${year}/${day}/test-input`, input)),
      switchMap(() => caught),
    )),
  )
}

function getRealInput(year: number, day: number): Observable<Buffer> {
  return defer(() => from(readFile(`./src/${year}/${day}/input`))).pipe(
    catchError((_, caught) => downloadInput(year, day).pipe(
      switchMap(input => writeFile(`./src/${year}/${day}/input`, input)),
      switchMap(() => caught),
    )),
  )
}

const input$ = opts.pipe(
  distinctUntilChanged(({ input: i0, year: y0, day: d0 }, { input: i1, year: y1, day: d1 }) => i0 === i1 && y0 === y1 && d0 === d1),
  switchMap(({ input, year, day }) => (input ? watchFile(`./src/${year}/${day}/input`) : watchFile(`./src/${year}/${day}/test-input`)).pipe(startWith(Symbol('FIRST')), map(() => ({ input, year, day })))),
  // TODO: Probably use throttle with `leading` and `training` both true?
  concatMap(({ input, year, day }) => (input ? getRealInput(year, day) : getTestInput(year, day))),
  map(String),
  share(),
)

combineLatest([
  getResult('I', opts, input$),
  getResult('II', opts, input$),
]).pipe(
  combineLatestWith(opts),
  watch ? identity : takeWhile(([[[I], [II]]]) => ![I, II].every(status => [Status.DONE, Status.ERROR].includes(status)), true),
  finalize(() => process.exit(0)),
).subscribe(([[I, II], { I: runI, II: runII, input, year, day }]) => printSolution(year, day, input, I, II, runI, runII))
