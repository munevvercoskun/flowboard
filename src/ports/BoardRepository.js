/**
 * PORT: the contract the application layer expects for persisting boards.
 *
 * This is the "ports and adapters" (hexagonal) seam. The services below depend
 * on THIS, not on any concrete store, so swapping in-memory for a file -- or
 * later a real database -- is a one-line change in the composition root
 * (src/config.js) and nothing in the application layer moves. See ADR-0002.
 *
 * JavaScript has no interfaces, so this is a base class whose methods throw
 * until an adapter overrides them -- it documents the contract and fails loudly
 * if an adapter forgets a method.
 */
export class BoardRepository {
  /** @returns {Promise<Board|null>} */
  async findById(_id) { throw new Error('not implemented'); }

  /** @returns {Promise<Board[]>} */
  async findAll() { throw new Error('not implemented'); }

  /** Persist (insert or update) a board. @returns {Promise<Board>} */
  async save(_board) { throw new Error('not implemented'); }
}
