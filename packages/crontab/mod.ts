import { Comlink } from "deps";
import type { ICronTab } from "./crontab.ts";
const { wrap, proxy } = Comlink;

export class CronTab implements ICronTab {
  private remote: ICronTab = wrap(
    new Worker("./crontab.ts", { type: "module" }),
  );
  cron(expression: string, handler: () => void): string {
    return this.remote.cron(expression, proxy(handler));
  }
  cancel(id?: string): void {
    return this.remote.cancel(id);
  }
  size(): number {
    return this.remote.size();
  }
  run(): void {
    return this.remote.run();
  }
  stop(): void {
    return this.remote.stop();
  }
}
