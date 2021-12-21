export type SolutionModule<T> = {
  parse(data: string): T;
  partI(input: T): unknown | ReadonlyArray<unknown>;
  partII(input: T): unknown | ReadonlyArray<unknown>;
};

export default function solution<T>(solutionModule: SolutionModule<T>): SolutionModule<T> {
  return solutionModule;
}
