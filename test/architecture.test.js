/**
 * Tests that double as evidence for the "testability" quality attribute.
 *
 * None of these start a web server or touch a database. Because the services
 * depend on PORTS, a test just hands them an in-memory repository and a real
 * event bus and exercises the use cases directly. That the whole thing is
 * testable without HTTP or I/O is a property of the architecture, not an accident.
 *
 * Run with:  npm test   (uses Node's built-in test runner, no framework)
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { buildContainer } from '../src/config.js';
import { orderCards } from '../src/application/ordering/orderingStrategies.js';
import { Card } from '../src/domain/Card.js';
import { Board } from '../src/domain/Board.js';

test('a card moves between columns and the board stays consistent', async () => {
  const { boardService, cardService } = buildContainer({ PERSISTENCE: 'memory' });
  const board = await boardService.createBoard('Sprint 1');
  const todo = await boardService.addColumn(board.id, 'To Do');
  const doing = await boardService.addColumn(board.id, 'In Progress');

  const card = await cardService.createCard(board.id, todo.id, { title: 'Write ADRs' });
  await cardService.moveCard(board.id, card.id, todo.id, doing.id);

  const fresh = await boardService.getBoard(board.id);
  assert.equal(fresh.column(todo.id).cards.length, 0, 'left the source column');
  assert.equal(fresh.column(doing.id).cards.length, 1, 'arrived in the target column');
});

test('the event bus feeds the activity log (Observer decoupling)', async () => {
  const { boardService, cardService, activityLog } = buildContainer({ PERSISTENCE: 'memory' });
  const board = await boardService.createBoard('Sprint 2');
  const col = await boardService.addColumn(board.id, 'Backlog');
  await cardService.createCard(board.id, col.id, { title: 'Draw C4 diagram' });

  const types = activityLog.recent().map((e) => e.type);
  assert.ok(types.includes('board.created'));
  assert.ok(types.includes('card.created'));
});

test('ordering Strategy sorts by priority', () => {
  const cards = [
    new Card({ title: 'a', priority: 'low' }),
    new Card({ title: 'b', priority: 'high' }),
    new Card({ title: 'c', priority: 'medium' }),
  ];
  const ordered = orderCards(cards, 'priority').map((c) => c.priority);
  assert.deepEqual(ordered, ['high', 'medium', 'low']);
});

test('domain invariants are enforced', () => {
  assert.throws(() => new Card({ title: '' }), /title is required/);
  assert.throws(() => new Card({ title: 'x', priority: 'urgent' }), /priority must be one of/);
  assert.throws(() => new Board({ name: '' }), /board name is required/);
});
