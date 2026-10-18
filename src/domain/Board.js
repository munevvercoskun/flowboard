import { newId } from './ids.js';
import { Column } from './Column.js';
import { DomainError } from './Card.js';

/**
 * A board -- the aggregate root. All changes to columns and cards go through the
 * board, so it's the one object responsible for the board's consistency (a card
 * exists in exactly one column, moves are atomic, etc.).
 */
export class Board {
  constructor({ id, name, columns = [] }) {
    if (!name || !name.trim()) throw new DomainError('board name is required');
    this.id = id ?? newId('board');
    this.name = name.trim();
    this.columns = columns.map((c) => (c instanceof Column ? c : new Column(c)));
  }

  addColumn(name) {
    const col = new Column({ name });
    this.columns.push(col);
    return col;
  }

  column(columnId) {
    const col = this.columns.find((c) => c.id === columnId);
    if (!col) throw new DomainError(`no column ${columnId} on board ${this.name}`);
    return col;
  }

  /** Move a card from one column to another, atomically. */
  moveCard(cardId, fromColumnId, toColumnId) {
    const from = this.column(fromColumnId);
    const to = this.column(toColumnId);
    const card = from.removeCard(cardId); // throws if not present
    to.addCard(card);
    return card;
  }

  locateCard(cardId) {
    for (const col of this.columns) {
      const card = col.findCard(cardId);
      if (card) return { column: col, card };
    }
    return null;
  }

  toJSON() {
    return { id: this.id, name: this.name, columns: this.columns.map((c) => c.toJSON()) };
  }
}
