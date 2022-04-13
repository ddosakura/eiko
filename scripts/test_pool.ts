import { Pool } from "@eiko/pool/mod.ts";
import { sleep } from "@eiko/shared/mod.ts";

const pool = new Pool(2);

const tasks: Record<string, number> = {
  1: 1000,
  2: 3000,
  3: 2000,
  4: 4000,
  5: 2000,
  6: 1000,
};

const now = +new Date();
(async () => {
  let size = 0;
  do {
    await sleep(500);
    const running = pool.getRunning();
    const waiting = pool.getWaiting();
    console.log({ running, waiting }, +new Date() - now);
    size = running.length + waiting.length;
  } while (size > 0);
})();
Object.entries(tasks).map(([name, d]) =>
  pool.run(name, async () => {
    await sleep(d);
    console.log(name, "done", +new Date() - now);
    return name;
  })
);
