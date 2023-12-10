import readline, { type Interface } from 'readline'
import { Writable } from 'stream'

import colours from '@colors/colors'

import { BehaviorSubject, Observable, Subject, filter, fromEvent, map, share, takeUntil } from 'rxjs'

const { blue } = colours
export type KeyPress = {
  sequence: string;
  name: string;
  ctrl: boolean;
  meta: boolean;
  shift: boolean;
}

export default class Prompt {

  private static registered?: Prompt
  /**
   * `true` when the user is typing in the terminal.
   * Then, the hotkeys are disabled.
   */
  private readonly reading$: BehaviorSubject<boolean> = new BehaviorSubject(false)
  // private readonly interfaceFeedback$: Subject<boolean> = new BehaviorSubject(false)
  private interface: Interface
  private readonly terminate$: Subject<true> = new Subject()

  public readonly keyPresse$: Observable<KeyPress> = fromEvent(process.stdin, 'keypress').pipe(
    filter(() => !this.reading$.getValue()),
    map(([, key]: [unknown, KeyPress]) => key),
    takeUntil(this.terminate$),
    share(),
  )

  terminal: readline.Interface

  private constructor(private prompt: string) {
    // process.stdin.setRawMode(true)
    this.updateInterface(false)

    /* eslint-disable */
    const redraw = this.redraw.bind(this) as (log?: () => void) => void
    global.console = new Proxy(global.console, {
      get(target, prop) {
        if (!['log', 'info', 'warn', 'table', 'timeStamp'].includes(String(prop))) {
          return target[prop]
        }

        return function log(...argArray: unknown[]) {
          return redraw(() => target[prop].call(target, ...argArray))
        }
      },
    })
    /* eslint-enable */

    this.refresh(prompt)
  }

  public static register(prompt: string): Prompt {
    if (typeof this.registered !== 'undefined') {
      throw new Error('Only one Prompt may be registered at a time')
    }

    return (this.registered = new Prompt(prompt))
  }

  public close(): void {
    this.terminate$.next(true)
    this.terminate$.complete()
  }

  public refresh(prompt: string): void {
    this.prompt = prompt
    this.redraw()
  }

  public stdinLineByLine(prompt: string): Observable<string> {
    // TODO: maybe just use `defer` here and create an Observable using `of`, `tap` and `finally` operators?
    return new Observable(sub => {
      process.stdout.write('\u001Bc')
      process.stdout.write(prompt)
      process.stdout.write('\n')

      this.reading$.next(true)
      this.updateInterface(true)
      const buffer: string[] = []

      this.interface.on('line', data => buffer.push(data))
      this.interface.on('close', () => {
        sub.next(buffer.join('\n'))
        sub.complete()
      })

      sub.add(() => {
        this.reading$.next(false)
        this.updateInterface(false)
      })
    })
  }

  private updateInterface(feedback: boolean): void {
    process.stdin.setRawMode(!feedback)

    if (typeof this.interface !== 'undefined') {
      this.interface.close()
    }

    this.interface = readline.createInterface({
      prompt: '',
      terminal: true,
      input: process.stdin,
      output: new Writable({
        write(_chunk, _encoding, callback) {
          if (feedback) {
            process.stdout.write(blue(String(_chunk)))
          }

          callback()
        },
      }),
    })
  }

  private redraw(log?: () => void): void {
    readline.moveCursor(process.stdout, -999, 0)
    readline.clearLine(process.stdout, 0);
    (this.prompt.match(/\n/g) ?? []).forEach(() => {
      readline.moveCursor(process.stdout, 0, -1)
      readline.clearLine(process.stdout, 0)
    })

    process.stdout.write('\r')

    if (typeof log === 'function') {
      log()
    }

    process.stdout.write(this.prompt)
  }

}
