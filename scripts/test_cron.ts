import { cron } from "deps";
console.log(cron.parseExpression("0/5 * * * * *").stringify(true));
console.log(
  cron.parseExpression("0 0 17 * * *", { tz: "UTC+8" }).stringify(true),
);
console.log(
  cron.parseExpression("0 0 17 * * *", { tz: "UTC+0" }).stringify(true),
);

// import { CronTab } from "@eiko/crontab/mod.ts";
// import { sleep } from "@eiko/shared/mod.ts";
// const cronTab = new CronTab();
// cronTab.cron("0/5 * * * * *", () => console.log(+new Date()));
// await sleep(20000);
