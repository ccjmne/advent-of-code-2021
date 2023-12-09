import solution from 'src/solution-module'
import { max } from 'src/tsutils'

const strengths = ['A', 'K', 'Q', 'J', 'T', 9, 8, 7, 6, 5, 4, 3, 2] as const
const strengths2 = ['A', 'K', 'Q', 'T', 9, 8, 7, 6, 5, 4, 3, 2]

type Card = typeof strengths[number]
type Hand = string

const mapper: Record<Card, string> = {
  A: 'M',
  K: 'L',
  Q: 'K',
  J: 'J',
  T: 'I',
  9: 'H',
  8: 'G',
  7: 'F',
  6: 'E',
  5: 'D',
  4: 'C',
  3: 'B',
  2: 'A',
}
const mapper2: Record<Card, string> = {
  A: 'M',
  K: 'L',
  Q: 'K',
  J: '0', // Jokers become zero
  T: 'I',
  9: 'H',
  8: 'G',
  7: 'F',
  6: 'E',
  5: 'D',
  4: 'C',
  3: 'B',
  2: 'A',
}

function type(hand: Hand): number {
  const m = strengths.map(s => [...hand.matchAll(new RegExp(String(s), 'g'))].length)
  if (max(m)! === 2) {
    return m.filter(n => n === 2).length + 1
  }

  if (max(m)! === 3) {
    return 4 + +m.some(n => n === 2)
  }

  return max(m)! === 1 ? 1 : max(m)! + 2
}

function type2(hand: Hand): number {
  const m = strengths2.map(s => [...hand.matchAll(new RegExp(String(s), 'g'))].length)
  const mm = max(m)! + [...hand.matchAll(/J/g)].length
  if (mm === 2) {
    return hand.includes('J') ? 2 : 2 + m.filter(n => n === 2).length - 1
  }

  if (mm === 3) {
    return hand.includes('J') ? 4 + +(m.filter(n => n === 2).length === 2) : 4 + +m.some(n => n === 2)
  }

  return mm === 1 ? 1 : mm + 2
}

export default solution({
  parse(data: string): ReadonlyArray<[hand: Hand, bid: number]> {
    return data
      .trim()
      .split(/\n/g)
      .map(line => line.split(/\s+/g).map((n, idx) => (idx === 0 ? n : +n)) as [Hand, number])
  },

  partI(input) {
    return input
      .map(([hand, bid]) => [type(hand) + hand.replace(/./g, c => mapper[c as Card]), bid] as const)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, bid], rank) => bid * (rank + 1))
      .reduce((sum, n) => sum + n)
  },

  partII(input) {
    return input
      .map(([hand, bid]) => [type2(hand) + hand.replace(/./g, c => mapper2[c as Card]), bid] as const)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, bid], rank) => bid * (rank + 1))
      .reduce((sum, n) => sum + n)
  },
})
