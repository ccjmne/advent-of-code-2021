import solution from 'src/solution-module';
import { range } from 'src/tsutils';

type XY = [number, number];
type Pixel = string;

function serialise([x, y]: XY): Pixel {
  return `${x},${y}`;
}

function deserialise(pixel: Pixel): XY {
  return pixel.split(',').map(Number) as XY;
}

function neighbours(pixel: Pixel): Pixel[] {
  const [x, y] = deserialise(pixel);
  return [-1, 0, 1].flatMap(Δy => [-1, 0, 1].map(Δx => serialise([x + Δx, y + Δy])));
}

function int(bools: boolean[]): number {
  return Number(`0b${bools.map(Number).join('')}`);
}

class Board {

  public readonly bounds: [[number, number], [number, number]];

  constructor(public readonly pixels: Set<Pixel>, private readonly outOfBounds = false) {
    this.bounds = [...pixels].map(deserialise).reduce(
      ([[x0, x1], [y0, y1]], [x, y]) => [[x < x0 ? x : x0, x > x1 ? x : x1], [y < y0 ? y : y0, y > y1 ? y : y1]],
      [[Infinity, -Infinity], [Infinity, -Infinity]],
    );
  }

  public enhance(lookup: string, steps = 1): Board {
    if (!steps) {
      return this;
    }

    const [[x0, x1], [y0, y1]] = this.bounds;
    const pixels = range(y1 - y0 + 1 + 2, { offset: y0 - 1 })
      .flatMap(y => range(x1 - x0 + 1 + 2, { offset: x0 - 1 })
        .map(x => serialise([x, y]))
        .filter(pixel => lookup.charAt(int(neighbours(pixel).map(p => this.isLit(p)))) === '#'));
    return new Board(
      new Set(pixels),
      lookup.charAt(int(Array(9).fill(this.outOfBounds))) === '#',
    ).enhance(lookup, steps - 1);
  }

  private isLit(pixel: Pixel): boolean {
    const [x, y] = deserialise(pixel);
    const [[x0, x1], [y0, y1]] = this.bounds;
    return this.pixels.has(pixel)
     || ((x < x0 || x > x1 || y < y0 || y > y1) && this.outOfBounds);
  }

}

export default solution({
  parse(input: string): [string, Board] {
    const [lookup, image] = input.split(/\n^$\n/gm);
    const pixels = image.trim().split(/\n/g).flatMap(((line, y) => line
      .split('')
      .map((char, x) => [char === '#', serialise([x, y])] as [boolean, Pixel]).filter(([lit]) => lit)
      .map(([, pixel]) => pixel)));
    return [lookup, new Board(new Set(pixels))];
  },

  partI([lookup, board]: [string, Board]) {
    return board.enhance(lookup, 2).pixels.size;
  },

  partII([lookup, board]: [string, Board]) {
    return board.enhance(lookup, 50).pixels.size;
  },
});
