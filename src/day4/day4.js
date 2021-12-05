'use strict';

import getInput from "../input.js";
import { range, style, Styles } from "../utils.js";

const BOARD_SIZE = 5;

const [draws, ...boardsData] = getInput(import.meta.url)
  .split(/\n/g)
  .filter(line => line !== '')
  .map(
    line => line
      .trimStart()
      .split(/,|\s+/)
      .map(value => parseInt(value))
  );

class Board {
  /**
   * Expects `BOARD_SIZE * BOARD_SIZE` cells.
   * @param { number[] } cells
   */
  constructor(cells) {
    this.cells = cells.map(value => ({ value, drawn: false }));
  }

  /**
   * Returns the score of the board if it is winning, `-1` otherwise.
   * @param { number } draw
   * @returns { number }
   */
  accept(draw) {
    const i = this.cells.findIndex(({ value }) => draw === value);
    if(i === -1) {
      return -1;
    }

    this.cells[i].drawn = true;
    const [row, col] = [Math.floor(i / BOARD_SIZE), i % BOARD_SIZE];
    return (
      range(BOARD_SIZE).every(c => this.cells[row * BOARD_SIZE + c].drawn)
      || range(BOARD_SIZE).every(r => this.cells[r * BOARD_SIZE + col].drawn)
    ) ? draw * this.cells
        .filter(({ drawn }) => !drawn)
        .reduce((score, { value }) => score + value, 0)
      : -1;
  }
}

/**
 * @returns { Board[] }
 */
function computeBoards() {
  return boardsData
    .flat()
    .reduce(
      ({ boards, cells }, value) =>
      cells.push(value) && (cells.length === BOARD_SIZE * BOARD_SIZE)
        ? { boards: [...boards, new Board(cells)], cells: [] }
        : { boards, cells },
      { boards: [], cells: [] }
    ).boards;
}

/**
 * @param { Board } board
 */
function drawBoard(board) {
  return '\n' + board.cells.reduce(
    ({ rows, cells }, cell) =>
      cells.push(cell) && (cells.length === BOARD_SIZE)
        ? { rows: [...rows, cells], cells: []}
        : { rows, cells },
    { rows: [], cells: [] }
  ).rows.map(
    row => row.map(
      ({ value, drawn }) => style(
        String(value).padStart(2), drawn ? Styles.BRIGHT | Styles.UNDERSCORE : Styles.RESET
      )
    ).join(' ')
  ).join('\n')
}

// PART I:

function first() {
  const boards = computeBoards();
  for (const draw of draws) {
    for (const board of boards) {
      const score = board.accept(draw);
      if (-1 !== score) {
        return { board, draw, score };
      }
    }
  }
}

console.log(
  'Part I:',
  '\n> Final score:', first().score,
  '\n> Winning draw:', first().draw,
  '\n> Winning board:', drawBoard(first().board),
);

// PART II:

function last() {
  const boards = new Set(computeBoards());
  for (const draw of draws) {
    for (const board of boards) {
      const score = board.accept(draw);
      if (-1 !== score) {
        boards.delete(board);
        if (boards.size === 0) {
          return { board, draw, score };
        }
      }
    }
  }
}

console.log(
  '\nPart II:',
  '\n> Last score:', last().score,
  '\n> Last draw:', last().draw,
  '\n> Last board:', drawBoard(last().board),
);
