import { Board } from '../domain/Board.js';
import { DomainError } from '../domain/Card.js';
import { EventTypes, domainEvent } from '../domain/events.js';
import { orderCards } from './ordering/orderingStrategies.js';

/**
 * Use cases for boards and columns. This is the application layer: it coordinates
 * the domain objects and the repository and publishes events. It depends only on
 * the repository PORT and the event bus -- not on HTTP, not on a concrete store.
 */
export class BoardService {
  constructor({ repository, eventBus }) {
    this.repo = repository;
    this.bus = eventBus;
  }

  async createBoard(name) {
    const board = new Board({ name });
    await this.repo.save(board);
    await this.bus.publish(domainEvent(EventTypes.BOARD_CREATED, { boardId: board.id, name: board.name }));
    return board;
  }

  async listBoards() {
    return this.repo.findAll();
  }

  async getBoard(boardId) {
    const board = await this.repo.findById(boardId);
    if (!board) throw new NotFoundError(`board ${boardId} not found`);
    return board;
  }

  async addColumn(boardId, name) {
    const board = await this.getBoard(boardId);
    const col = board.addColumn(name);
    await this.repo.save(board);
    await this.bus.publish(domainEvent(EventTypes.COLUMN_ADDED, { boardId, columnId: col.id, name: col.name }));
    return col;
  }

  /** List a column's cards through a chosen ordering Strategy. */
  async listCards(boardId, columnId, order = 'created') {
    const board = await this.getBoard(boardId);
    const col = board.column(columnId);
    return orderCards(col.cards, order);
  }
}

/** Raised when a requested resource doesn't exist. The HTTP layer maps this to 404. */
export class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export { DomainError };
