import { DomainError } from '../../domain/Card.js';
import { NotFoundError } from '../../application/BoardService.js';

/**
 * The single place HTTP status codes are decided. Domain and application errors
 * bubble up as plain exceptions; this terminal middleware maps each error TYPE
 * to a status, so the services never import anything HTTP-related (dependency
 * inversion -- the web layer adapts to the core, not the other way around).
 */
export function errorHandler() {
  // Express needs all four args to recognise this as an error handler.
  return (err, req, res, _next) => {
    if (err instanceof DomainError) {
      return res.status(400).json({ error: err.message });
    }
    if (err instanceof NotFoundError) {
      return res.status(404).json({ error: err.message });
    }
    console.error('[error]', err);
    return res.status(500).json({ error: 'internal error' });
  };
}
