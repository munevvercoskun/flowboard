import { Router } from 'express';
import { asyncRoute } from '../middleware/asyncRoute.js';

/**
 * Board & column HTTP routes. The routes are thin on purpose: parse the request,
 * call a service method, shape the response. No business logic lives here -- that
 * keeps the same rules reachable from any other entry point (a CLI, a queue
 * consumer) without copying code.
 */
export function boardRoutes({ boardService }) {
  const r = Router();

  // POST /boards  { name }
  r.post('/', asyncRoute(async (req, res) => {
    const board = await boardService.createBoard(req.body?.name);
    res.status(201).json(board.toJSON());
  }));

  // GET /boards
  r.get('/', asyncRoute(async (_req, res) => {
    const boards = await boardService.listBoards();
    res.json(boards.map((b) => b.toJSON()));
  }));

  // GET /boards/:boardId
  r.get('/:boardId', asyncRoute(async (req, res) => {
    const board = await boardService.getBoard(req.params.boardId);
    res.json(board.toJSON());
  }));

  // POST /boards/:boardId/columns  { name }
  r.post('/:boardId/columns', asyncRoute(async (req, res) => {
    const col = await boardService.addColumn(req.params.boardId, req.body?.name);
    res.status(201).json(col.toJSON());
  }));

  // GET /boards/:boardId/columns/:columnId/cards?order=priority|created|title
  r.get('/:boardId/columns/:columnId/cards', asyncRoute(async (req, res) => {
    const cards = await boardService.listCards(
      req.params.boardId, req.params.columnId, req.query.order ?? 'created');
    res.json(cards.map((c) => c.toJSON()));
  }));

  return r;
}
