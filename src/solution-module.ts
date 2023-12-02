export type SolutionModule<T> = {
  parse(data: string): T;

  /**
   * Whether `partI` mutates the input.
   *
   * If `true`, the input will be recomputed before being passed to `partII`.
   */
  mutatesInput?: true;
  partI(input: T): unknown | ReadonlyArray<unknown>;
  partII(input: T): unknown | ReadonlyArray<unknown>;
}

export default function solution<T>(solutionModule: SolutionModule<T>): SolutionModule<T> {
  return solutionModule
}
