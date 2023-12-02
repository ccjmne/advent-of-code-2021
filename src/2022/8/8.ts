import solution from 'src/solution-module';
import { range } from 'src/tsutils';

export default solution({
  parse(data): { NS: number[][], WE: number[][] } {
    const WE = data
      .split(/\n/g)
      .map(line => line.split('').map(Number));
    return { WE, NS: range(WE[0].length).map(c => WE.map(row => row[c])) };
  },

  partI({ WE, NS }: { NS: number[][], WE: number[][] }): number {
    const visibles: Set<`${number},${number}`> = new Set();
    function testVisibility({ height, highest, r, c }: { height: number, highest: number, r: number, c: number }): number {
      if (height > highest) {
        visibles.add(`${r},${c}`);
      }

      return Math.max(highest, height);
    }

    WE.forEach((row, r) => {
      row.reduce((highest, height, c) => testVisibility({ height, highest, r, c }), -Infinity); // from the West
      row.reduceRight((highest, height, c) => testVisibility({ height, highest, r, c }), -Infinity); // from the East
    });

    NS.forEach((col, c) => {
      col.reduce((highest, height, r) => testVisibility({ height, highest, r, c }), -Infinity); // from the North
      col.reduceRight((highest, height, r) => testVisibility({ height, highest, r, c }), -Infinity); // from the South
    });

    return visibles.size;
  },

  partII({ WE, NS }: { NS: number[][], WE: number[][] }): number {
    function lineOfSight(tree: number, path: number[], reverse = false): number {
      return path[reverse ? 'reduceRight' : 'reduce'](
        ({ highest, distance }, height) => ({ highest: Math.max(highest, height), distance: distance + +(highest < tree) }),
        { highest: -Infinity, distance: 0 },
      ).distance;
    }

    return Math.max(...WE.flatMap(
      (row, r) => row.map((tree, c) => 1
        * lineOfSight(tree, WE[r].slice(c + 1)) // towards the East
        * lineOfSight(tree, WE[r].slice(0, c), true) // towards the West
        * lineOfSight(tree, NS[c].slice(r + 1)) // towards the South
        * lineOfSight(tree, NS[c].slice(0, r), true)), // towards the North
    ));
  },
});
