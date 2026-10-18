import { BoardRepository } from '../../ports/BoardRepository.js';

/**
 * ADAPTER: keeps boards in a Map. Fast, zero-setup, and the default for running
 * the app. Data is lost on restart -- fine for a demo, and the point is that the
 * application layer can't tell the difference between this and the file adapter.
 */
export class InMemoryBoardRepository extends BoardRepository {
  #boards = new Map();

  async findById(id) { return this.#boards.get(id) ?? null; }

  async findAll() { return [...this.#boards.values()]; }

  async save(board) {
    this.#boards.set(board.id, board);
    return board;
  }
}
