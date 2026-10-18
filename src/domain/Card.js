import { newId } from './ids.js';

export const PRIORITIES = Object.freeze(['low', 'medium', 'high']);

/**
 * A card on the board -- the smallest unit of work.
 *
 * Pure domain object: it validates its own invariants and knows nothing about
 * HTTP, storage, or events. Priority must be one of PRIORITIES; title must be
 * non-empty.
 */
export class Card {
  constructor({ id, title, priority = 'medium', assignee = null, createdAt }) {
    if (!title || !title.trim()) throw new DomainError('card title is required');
    if (!PRIORITIES.includes(priority)) {
      throw new DomainError(`priority must be one of ${PRIORITIES.join(', ')}`);
    }
    this.id = id ?? newId('card');
    this.title = title.trim();
    this.priority = priority;
    this.assignee = assignee;
    this.createdAt = createdAt ?? new Date().toISOString();
  }

  assignTo(user) {
    if (!user || !user.trim()) throw new DomainError('assignee cannot be empty');
    this.assignee = user.trim();
  }

  toJSON() {
    return {
      id: this.id, title: this.title, priority: this.priority,
      assignee: this.assignee, createdAt: this.createdAt,
    };
  }
}

/** Raised when a domain invariant is violated. The HTTP layer maps this to 400. */
export class DomainError extends Error {
  constructor(message) {
    super(message);
    this.name = 'DomainError';
  }
}
