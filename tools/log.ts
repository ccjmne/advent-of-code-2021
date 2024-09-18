import { writeFileSync } from 'fs'

export default function log(...args: unknown[]): void {
  writeFileSync('debug.log', `${new Date().toISOString().slice(11, 23)} — ${args.map(arg => JSON.stringify(arg)).join(' ')}\n`, { flag: 'a' })
}
