import { expose } from "@eiko/worker/mod.ts";
import type { ParserOptions } from "../deps.ts";
import { CronHandler, CronJob } from "../job.ts";

const jobs = new Map<string, CronJob>();
const cronGroup = {
  cron(
    expression: string,
    handler: CronHandler,
    options?: ParserOptions<false>,
  ) {
    const id = crypto.randomUUID();
    jobs.set(id, new CronJob(expression, handler, options));
    return id;
  },
  delete(...ids: string[]) {
    ids.forEach((key) => jobs.delete(key));
  },
  clear() {
    jobs.clear();
  },
  size() {
    return jobs.size;
  },
  stop(...ids: string[]) {
    const keys = ids.length === 0 ? Array.from(jobs.keys()) : ids;
    keys.forEach((key) => jobs.get(key)?.stop());
  },
  start(endDate?: number, ...ids: string[]) {
    const keys = ids.length === 0 ? Array.from(jobs.keys()) : ids;
    keys.forEach((key) => jobs.get(key)?.start(endDate));
  },
};

export type ICronGroup = typeof cronGroup;

expose(cronGroup);
