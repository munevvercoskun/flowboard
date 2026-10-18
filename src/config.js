import { EventBus } from './application/EventBus.js';
import { BoardService } from './application/BoardService.js';
import { CardService } from './application/CardService.js';
import { ActivityLog } from './application/observers/ActivityLog.js';
import { Notifier } from './application/observers/Notifier.js';

import { InMemoryBoardRepository } from './adapters/persistence/InMemoryBoardRepository.js';
import { JsonFileBoardRepository } from './adapters/persistence/JsonFileBoardRepository.js';
import { ConsoleChannel } from './adapters/notifications/ConsoleChannel.js';
import { WebhookChannel } from './adapters/notifications/WebhookChannel.js';

/**
 * THE COMPOSITION ROOT.
 *
 * This is the one file that knows about concrete adapters. Everything else
 * depends on ports/abstractions; here we pick the implementations based on
 * environment variables and wire the object graph together. Changing the
 * database or adding a Slack channel is a change HERE and nowhere else -- which
 * is the whole payoff of the ports-and-adapters structure.
 *
 *   PERSISTENCE = memory | file         (default: memory)
 *   DATA_FILE   = path for the file adapter   (default: ./data/boards.json)
 *   WEBHOOK_URL = if set, also notify this URL
 */
export function buildContainer(env = process.env) {
  // --- pick the persistence adapter (ADR-0002) ---
  const repository = env.PERSISTENCE === 'file'
    ? new JsonFileBoardRepository(env.DATA_FILE || './data/boards.json')
    : new InMemoryBoardRepository();

  // --- the event bus and its observers (ADR-0003) ---
  const eventBus = new EventBus();
  const activityLog = new ActivityLog(eventBus);

  const channels = [new ConsoleChannel()];
  if (env.WEBHOOK_URL) channels.push(new WebhookChannel(env.WEBHOOK_URL));
  // The Notifier wires itself to the bus in its constructor.
  // eslint-disable-next-line no-new
  new Notifier(eventBus, channels);

  // --- the application services ---
  const boardService = new BoardService({ repository, eventBus });
  const cardService = new CardService({ repository, eventBus });

  return { repository, eventBus, activityLog, boardService, cardService };
}
