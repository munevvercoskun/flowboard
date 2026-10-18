import { newId } from './ids.js';
import { Card, DomainError } from './Card.js';

/**
 * A column (list) on a board, e.g. "To Do", "In Progress", "Done". Holds an
 * ordered list of cards and the operations that keep that list consistent.
 */
export class Column {
  constructor({ id, name, cards = [] }) {
    if (!name || !name.trim()) throw new DomainError('column name is required');
    this.id = id ?? newId('col');
    this.name = name.trim();
    this.cards = cards.map((c) => (c instanceof Card ? c : new Card(c)));
  }

  addCard(card) {
    this.cards.push(card);
    return card;
  }

  removeCard(cardId) {
    const idx = this.cards.findIndex((c) => c.id === cardId);
    if (idx === -1) throw new DomainError(`card ${cardId} not in column ${this.name}`);
    return this.cards.splice(idx, 1)[0];
  }

  findCard(cardId) {
    return this.cards.find((c) => c.id === cardId) ?? null;
  }

  toJSON() {
    return { id: this.id, name: this.name, cards: this.cards.map((c) => c.toJSON()) };
  }
}
