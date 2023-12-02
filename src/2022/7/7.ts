import { forSure } from 'src/maybe';
import solution from 'src/solution-module';
import { min, sum } from 'src/tsutils';
import { type RegExpWGroups } from 'src/types.d';

class Node {

  private readonly childrenMap: Map<string, Node> = new Map();
  public get children(): Node[] {
    return [...this.childrenMap.values()];
  }

  public get size(): number {
    return this.intrinsicSize + sum(this.children.map(({ size }) => size));
  }

  private constructor(
    public readonly name: string,
    public readonly isDir: boolean,
    private readonly parent?: Node,
    private readonly intrinsicSize: number = 0,
  ) {}

  public static root(): Node {
    return new Node('/', true);
  }

  public cd(to: string): Node {
    return forSure(to === '..' ? this.parent : this.childrenMap.get(to));
  }

  public touch(name: string, isDir: boolean, size = 0): void {
    this.childrenMap.set(name, new Node(name, isDir, this, size));
  }

}

function browse(node: Node): Node[] {
  return [node, ...node.children.flatMap(browse)];
}

export default solution({
  parse(data: string): Node {
    const root: Node = Node.root();
    let cur = root;
    data
      .split(/\n/g)
      .filter(line => !/^\$ ls$/.test(line))
      .forEach(line => {
        if (/^\$ cd [a-z/.]+$/.test(line)) {
          const { cd } = (/^\$ cd (?<cd>[a-z/.]+)$/.exec(line) as RegExpWGroups<'cd'>).groups;
          cur = cd === '/' ? root : cur.cd(cd);
        } else if (/^dir \w+$/.test(line)) {
          cur.touch((/^dir (?<dir>\w+)$/.exec(line) as RegExpWGroups<'dir'>).groups.dir, true);
        } else {
          const { size, name } = (/^(?<size>\d+) (?<name>[\w.]+)$/.exec(line) as RegExpWGroups<'size' | 'name'>).groups;
          cur.touch(name, false, Number(size));
        }
      });

    return root;
  },

  partI(tree: Node): number {
    return sum(
      browse(tree).filter(({ isDir, size }) => isDir && size <= 100000),
      ({ size }) => size,
    );
  },

  partII(tree: Node): number {
    return forSure(min(
      browse(tree).filter(({ isDir, size }) => isDir && size >= (30000000 - (70000000 - tree.size))),
      ({ size }) => size,
    )).size;
  },
});
