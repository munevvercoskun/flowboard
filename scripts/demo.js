/**
 * A scripted tour of the API without needing curl. Builds the container with the
 * in-memory adapter, drives a board through its lifecycle, and prints the state
 * plus the activity feed the observers recorded.
 *
 *   npm run demo
 */
import { buildContainer } from '../src/config.js';

const { boardService, cardService, activityLog } = buildContainer({ PERSISTENCE: 'memory' });

const board = await boardService.createBoard('Portfolio sprint');
const todo = await boardService.addColumn(board.id, 'To Do');
const doing = await boardService.addColumn(board.id, 'In Progress');
const done = await boardService.addColumn(board.id, 'Done');

const c1 = await cardService.createCard(board.id, todo.id, { title: 'Finish ELE 888 repo', priority: 'high' });
const c2 = await cardService.createCard(board.id, todo.id, { title: 'Record demo video', priority: 'low' });
await cardService.createCard(board.id, todo.id, { title: 'Write README', priority: 'medium' });

await cardService.moveCard(board.id, c1.id, todo.id, doing.id);
await cardService.assignCard(board.id, c1.id, 'mona');
await cardService.moveCard(board.id, c1.id, doing.id, done.id);

console.log('\n--- To Do, ordered by priority ---');
const ordered = await boardService.listCards(board.id, todo.id, 'priority');
ordered.forEach((c) => console.log(`  [${c.priority}] ${c.title}`));

console.log('\n--- Board state ---');
const fresh = await boardService.getBoard(board.id);
fresh.columns.forEach((col) => console.log(`  ${col.name}: ${col.cards.map((c) => c.title).join(', ') || '(empty)'}`));

console.log('\n--- Activity feed (newest first) ---');
activityLog.recent(10).forEach((e) => console.log(`  ${e.at}  ${e.type}`));
console.log();
