export * from "./job.ts";

import { Local, proxy, Remote, runSync } from "@eiko/worker/mod.ts";
import type { ICronGroup } from "./worker/group.ts";
import type { ParserOptions } from "./deps.ts";
import type { CronHandler } from "./job.ts";

export class CronGroup implements Local<Remote<ICronGroup>> {
  private remote: Remote<ICronGroup>;
  private terminateWorker: () => void;
  constructor() {
    const { remote, terminate } = runSync<ICronGroup>(
      new URL("./worker/group.ts", import.meta.url).href,
      { namespace: true, permissions: "none" },
    );
    this.remote = remote;
    this.terminateWorker = terminate;
  }
  terminate() {
    this.terminateWorker();
  }

  cron(
    expression: string,
    handler: CronHandler,
    options?: ParserOptions<false>,
  ): Promise<string> {
    return this.remote.cron(expression, proxy(handler), options);
  }
  delete(...ids: string[]): Promise<void> {
    return this.remote.delete(...ids);
  }
  clear(): Promise<void> {
    return this.remote.clear();
  }
  size(): Promise<number> {
    return this.remote.size();
  }
  stop(...ids: string[]): Promise<void> {
    return this.remote.stop(...ids);
  }
  start(endDate?: number, ...ids: string[]): Promise<void> {
    return this.remote.start(endDate, ...ids);
  }
}
