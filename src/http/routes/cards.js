import { Router } from 'express';
import { asyncRoute } from '../middleware/asyncRoute.js';

/** Card HTTP routes: create, move, assign. */
export function cardRoutes({ cardService }) {
  const r = Router();

  // POST /boards/:boardId/columns/:columnId/cards  { title, priority?, assignee? }
  r.post('/:boardId/columns/:columnId/cards', asyncRoute(async (req, res) => {
    const card = await cardService.createCard(
      req.params.boardId, req.params.columnId, req.body ?? {});
    res.status(201).json(card.toJSON());
  }));

  // POST /boards/:boardId/cards/:cardId/move  { from, to }
  r.post('/:boardId/cards/:cardId/move', asyncRoute(async (req, res) => {
    const card = await cardService.moveCard(
      req.params.boardId, req.params.cardId, req.body?.from, req.body?.to);
    res.json(card.toJSON());
  }));

  // POST /boards/:boardId/cards/:cardId/assign  { assignee }
  r.post('/:boardId/cards/:cardId/assign', asyncRoute(async (req, res) => {
    const card = await cardService.assignCard(
      req.params.boardId, req.params.cardId, req.body?.assignee);
    res.json(card.toJSON());
  }));

  return r;
}
