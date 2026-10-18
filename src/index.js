import { buildContainer } from './config.js';
import { createApp } from './http/server.js';

const container = buildContainer();
const app = createApp(container);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  const mode = process.env.PERSISTENCE === 'file' ? 'file' : 'in-memory';
  console.log(`FlowBoard listening on http://localhost:${port}  (persistence: ${mode})`);
});
