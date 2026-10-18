import { Card } from '../domain/Card.js';
import { EventTypes, domainEvent } from '../domain/events.js';
import { NotFoundError } from './BoardService.js';

/**
 * Use cases for cards: create, move between columns, assign. Same shape as
 * BoardService -- depends on the repository port and the event bus, publishes a
 * domain event after each change so the observers can react.
 */
export class CardService {
  constructor({ repository, eventBus }) {
    this.repo = repository;
    this.bus = eventBus;
  }

  async #board(boardId) {
    const board = await this.repo.findById(boardId);
    if (!board) throw new NotFoundError(`board ${boardId} not found`);
    return board;
  }

  async createCard(boardId, columnId, { title, priority, assignee }) {
    const board = await this.#board(boardId);
    const column = board.column(columnId); // throws DomainError if missing
    const card = new Card({ title, priority, assignee });
    column.addCard(card);
    await this.repo.save(board);
    await this.bus.publish(domainEvent(EventTypes.CARD_CREATED,
      { boardId, columnId, cardId: card.id, title: card.title }));
    return card;
  }

  async moveCard(boardId, cardId, fromColumnId, toColumnId) {
    const board = await this.#board(boardId);
    const card = board.moveCard(cardId, fromColumnId, toColumnId);
    await this.repo.save(board);
    await this.bus.publish(domainEvent(EventTypes.CARD_MOVED,
      { boardId, cardId, fromColumnId, toColumnId }));
    return card;
  }

  async assignCard(boardId, cardId, assignee) {
    const board = await this.#board(boardId);
    const located = board.locateCard(cardId);
    if (!located) throw new NotFoundError(`card ${cardId} not found on board ${boardId}`);
    located.card.assignTo(assignee);
    await this.repo.save(board);
    await this.bus.publish(domainEvent(EventTypes.CARD_ASSIGNED, { boardId, cardId, assignee }));
    return located.card;
  }
}
