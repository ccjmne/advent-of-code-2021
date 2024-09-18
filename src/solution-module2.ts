type BaseSolution<T> = {
  type: 1;
  parse: (data: string) => T;
  mutatesInput?: true;
  partI: (input: T) => unknown;
  partII: (input: T) => unknown;
} | {
  type: 2;
  parseI: (data: string) => T;
  parseII: (data: string) => T;
  part: (input: T) => unknown;
} | {
  type: 3;
  partI: (input: string) => unknown;
  partII: (input: string) => unknown;
}

export type SolutionModule<T> = BaseSolution<T> & {
  [K in keyof BaseSolution<T>]: K extends 'type' ? BaseSolution<T>[K] : never;
}

export default function solution<T>(solutionModule: SolutionModule<T>): SolutionModule<T> {
  return solutionModule
}
