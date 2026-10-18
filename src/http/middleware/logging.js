/**
 * Request-logging middleware. One of three middleware in the chain (logging ->
 * routes -> error handler) -- the pipe-and-filter shape Express gives you, where
 * each concern is a stage that can be added or removed independently.
 */
export function logging() {
  return (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      console.log(`${req.method} ${req.originalUrl} -> ${res.statusCode} (${Date.now() - start}ms)`);
    });
    next();
  };
}
