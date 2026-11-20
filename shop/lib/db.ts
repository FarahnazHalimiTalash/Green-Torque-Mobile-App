import { promises as fs } from "fs";
import path from "path";

import { createShopState } from "./seed";
import type { ShopState } from "./types";

const dbPath = path.join(process.cwd(), "data", "db.json");

let queue: Promise<unknown> = Promise.resolve();

async function readFile(): Promise<ShopState> {
  try {
    const raw = await fs.readFile(dbPath, "utf8");
    return JSON.parse(raw) as ShopState;
  } catch {
    const seeded = createShopState();
    await fs.mkdir(path.dirname(dbPath), { recursive: true });
    await fs.writeFile(dbPath, JSON.stringify(seeded, null, 2));
    return seeded;
  }
}

export function readDb() {
  const run = queue.then(() => readFile());
  queue = run.catch(() => undefined);
  return run;
}

export function updateDb(mutator: (state: ShopState) => ShopState) {
  const run = queue.then(async () => {
    const current = await readFile();
    const next = mutator(current);
    await fs.mkdir(path.dirname(dbPath), { recursive: true });
    await fs.writeFile(dbPath, JSON.stringify(next, null, 2));
    return next;
  });
  queue = run.catch(() => undefined);
  return run;
}

export async function resetDb() {
  const seeded = createShopState();
  await fs.mkdir(path.dirname(dbPath), { recursive: true });
  await fs.writeFile(dbPath, JSON.stringify(seeded, null, 2));
  return seeded;
}
