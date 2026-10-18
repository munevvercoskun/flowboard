/**
 * Wraps an async route handler so a rejected promise is forwarded to the error
 * middleware instead of hanging the request. Small helper, but it keeps every
 * route free of repetitive try/catch.
 */
export const asyncRoute = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
