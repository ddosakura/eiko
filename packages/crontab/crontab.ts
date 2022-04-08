import { Comlink, cron } from "deps";
const { expose } = Comlink;

export interface CronJob {
  exp: string;
  handler: () => void;
}
const jobs = new Map<string, CronJob>();
const schedules = new Map<string, string[]>();
const executeJobs = () => {
  const date = new Date();
  schedules.forEach((ids, exp) => {
    // date match exp
    if (true) {
      ids.map((id) => jobs.get(id)).forEach((job) => job?.handler());
    }
  });
};

let isRunning = false;
let intervalID: ReturnType<typeof setInterval>;
const runScheduler = () =>
  intervalID = setInterval(() => {
    if (!isRunning) return clearInterval(intervalID);
    executeJobs();
  }, 1000);
runScheduler();

const cronTab = {
  cron(
    expression: string,
    handler: () => void,
    options: cron.ParserOptions<false> = { tz: "UTC+8" },
  ) {
    const exp = cron.parseExpression(expression, options).stringify(true);
    const id = crypto.randomUUID();
    jobs.set(id, { exp, handler });
    if (!schedules.has(exp)) schedules.set(exp, []);
    schedules.get(exp)?.push(id);
    return id;
  },
  cancel(id?: string) {
    if (!id) return jobs.clear();
    const job = jobs.get(id);
    if (!job) return;
    jobs.delete(id);
    const { exp } = job;
    const ids = schedules.get(exp) ?? [];
    if (ids.length <= 1) {
      schedules.delete(exp);
    } else {
      schedules.set(exp, ids.filter((item) => item !== id));
    }
  },
  size() {
    return jobs.size;
  },
  run() {
    if (isRunning) return;
    isRunning = true;
    runScheduler();
  },
  stop() {
    isRunning = false;
  },
};

export type ICronTab = typeof cronTab;

expose(cronTab);
