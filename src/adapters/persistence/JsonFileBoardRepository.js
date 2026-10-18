import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

import { BoardRepository } from '../../ports/BoardRepository.js';
import { Board } from '../../domain/Board.js';

/**
 * ADAPTER: persists boards as a JSON file, so data survives a restart. Same
 * contract as the in-memory adapter -- selecting it is one line in config.js
 * (set PERSISTENCE=file). Rehydrates plain JSON back into real Board objects so
 * the domain behaviour comes back with the data.
 */
export class JsonFileBoardRepository extends BoardRepository {
  constructor(filePath) {
    super();
    this.filePath = filePath;
  }

  async #load() {
    try {
      const raw = await readFile(this.filePath, 'utf8');
      const data = JSON.parse(raw);
      return new Map(data.map((b) => [b.id, new Board(b)]));
    } catch (err) {
      if (err.code === 'ENOENT') return new Map(); // first run: no file yet
      throw err;
    }
  }

  async #persist(map) {
    await mkdir(dirname(this.filePath), { recursive: true });
    const data = [...map.values()].map((b) => b.toJSON());
    await writeFile(this.filePath, JSON.stringify(data, null, 2));
  }

  async findById(id) { return (await this.#load()).get(id) ?? null; }

  async findAll() { return [...(await this.#load()).values()]; }

  async save(board) {
    const map = await this.#load();
    map.set(board.id, board);
    await this.#persist(map);
    return board;
  }
}
