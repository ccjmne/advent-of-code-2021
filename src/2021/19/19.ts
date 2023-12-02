import { hasKey, isNotNil, Maybe } from 'src/maybe';
import solution from 'src/solution-module';
import { mapFind, occurrences } from 'src/tsutils';

type Vector3 = [number, number, number];
const ROTATIONS: ReadonlyArray<(v: Vector3) => Vector3> = [
  ([x, y, z]) => [x, y, z],
  ([x, y, z]) => [z, y, -x],
  ([x, y, z]) => [-x, y, -z],
  ([x, y, z]) => [-z, y, x],
  ([x, y, z]) => [-x, -y, z],
  ([x, y, z]) => [-z, -y, -x],
  ([x, y, z]) => [x, -y, -z],
  ([x, y, z]) => [z, -y, x],
  ([x, y, z]) => [y, z, x],
  ([x, y, z]) => [-y, z, -x],
  ([x, y, z]) => [x, z, -y],
  ([x, y, z]) => [-x, z, y],
  ([x, y, z]) => [x, -z, y],
  ([x, y, z]) => [-x, -z, -y],
  ([x, y, z]) => [y, -z, -x],
  ([x, y, z]) => [-y, -z, x],
  ([x, y, z]) => [z, x, y],
  ([x, y, z]) => [-z, x, -y],
  ([x, y, z]) => [y, x, -z],
  ([x, y, z]) => [-y, x, z],
  ([x, y, z]) => [y, -x, z],
  ([x, y, z]) => [-y, -x, -z],
  ([x, y, z]) => [z, -x, -y],
  ([x, y, z]) => [-z, -x, y],
];

type ScannerReport = {
  id: number;
  reports: ReadonlyArray<[number, number, number]>;
  at: Vector3;
};

function minus([x, y, z]: Vector3, [i, j, k]: Vector3): Vector3 {
  return [x - i, y - j, z - k];
}

function serialise(v: Vector3): string {
  return v.join(',');
}

function deserialise(s: string): Vector3 {
  return s.split(/,/g).map(Number) as Vector3;
}

function tryReadjust({ reports, ...scanner }: ScannerReport, ref: ScannerReport): Maybe<ScannerReport> {
  const matched = ROTATIONS
    .map(θ => ({ θ, Δs: reports.flatMap(beacon => ref.reports.map(refBeacon => serialise(minus(θ(beacon), refBeacon)))) }))
    .map(({ θ, Δs }) => ({ θ, Δ: Object.entries(occurrences(Δs)).find(([, count]) => count >= 12)?.[0] }))
    .find(hasKey('Δ'));

  if (!matched) {
    return null;
  }

  const { θ, Δ } = matched;
  // eslint-disable-next-line no-console
  console.log(`Scanner`, scanner.id, `is at`, minus([0, 0, 0], deserialise(Δ)), `(neighbour of Scanner ${ref.id})`);
  return { ...scanner, at: minus([0, 0, 0], deserialise(Δ)), reports: reports.map(beacon => minus(θ(beacon), deserialise(Δ))) };
}

function solve(
  { todo, refs, ooReach }: { todo: ScannerReport[], refs: ScannerReport[], ooReach: ScannerReport[] },
): { todo: ScannerReport[], refs: ScannerReport[], ooReach: ScannerReport[] } {
  if (!todo.length) {
    return { todo, refs, ooReach };
  }

  const readjusted = todo.map(rem => mapFind(refs, ref => tryReadjust(rem, ref))).filter(isNotNil);
  return solve({
    todo: todo.filter(({ id }) => readjusted.every(({ id: other }) => id !== other)),
    refs: readjusted,
    ooReach: [...ooReach, ...refs],
  });
}

export default solution({
  parse(data: string): ScannerReport[] {
    return data.split(/\n^$\n/gm).map(report => ({
      id: Number(/scanner (\d+)/.exec(report)?.[1]),
      reports: report.trim().split(/\n/g).slice(1).map(deserialise),
      at: [0, 0, 0],
    }));
  },

  partI(input: ScannerReport[]) {
    const { refs, ooReach: isolated } = solve({ todo: input.slice(1), refs: input.slice(0, 1), ooReach: [] });
    return [...new Set([...refs, ...isolated].flatMap(({ reports }) => reports).map(serialise))].length;
  },

  partII(input: ScannerReport[]) {
    const { refs, ooReach: isolated } = solve({ todo: input.slice(1), refs: input.slice(0, 1), ooReach: [] });
    const scanners = [...refs, ...isolated];
    return Math.max(...scanners
      .flatMap((l, i) => scanners.slice(i + 1).map(r => [l, r]))
      .map(([{ at: [x, y, z] }, { at: [i, j, k] }]) => Math.abs(i - x) + Math.abs(j - y) + Math.abs(k - z)));
  },
});
