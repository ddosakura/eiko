import { CronJob } from "@eiko/cron/job.ts";
import { sleep } from "@eiko/shared/mod.ts";

const job = new CronJob("0/1 * * * * *", () => console.log(+new Date()));
console.log("start");
await sleep(4000);
console.log("stop");
job.stop();
await sleep(2000);
console.log("start");
job.start(+new Date() + 6000);
await sleep(4000);
console.log("end");
