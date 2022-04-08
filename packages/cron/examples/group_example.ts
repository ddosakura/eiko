import { CronGroup } from "@eiko/cron/mod.ts";
import { sleep } from "@eiko/shared/mod.ts";

const group = new CronGroup();
group.cron("0/1 * * * * *", () => console.log(1, +new Date()));
group.cron("0/2 * * * * *", () => console.log(2, +new Date()));
console.log("start");
await sleep(4000);
console.log("stop");
group.stop();
await sleep(2000);
console.log("start");
group.start(+new Date() + 6000);
await sleep(4000);
console.log("end");
group.terminate();
await sleep(4000);
console.log("terminate");
