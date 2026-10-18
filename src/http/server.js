import express from 'express';

import { logging } from './middleware/logging.js';
import { errorHandler } from './middleware/errorHandler.js';
import { boardRoutes } from './routes/boards.js';
import { cardRoutes } from './routes/cards.js';

/**
 * Builds the Express app from already-wired dependencies. It takes the services
 * and the activity log as arguments rather than importing them -- so the app can
 * be built with real adapters for production or test doubles for a test, with no
 * change here. The middleware chain is: logging -> JSON parsing -> routes ->
 * error handler.
 */
export function createApp({ boardService, cardService, activityLog }) {
  const app = express();
  app.use(express.json());
  app.use(logging());

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  app.get('/activity', (req, res) =>
    res.json(activityLog.recent(Number(req.query.n) || 50)));

  app.use('/boards', boardRoutes({ boardService }));
  app.use('/boards', cardRoutes({ cardService }));

  app.use(errorHandler()); // must be last
  return app;
}
