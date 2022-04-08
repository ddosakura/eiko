import { CronExpression, parseExpression, ParserOptions } from "./deps.ts";

export const cronJob = (
  expression: string,
  handler: CronHandler,
  options?: ParserOptions<false>,
) => new CronJob(expression, handler, options);

export type CronHandler = () => void | Promise<void>;

export class CronJob {
  private expression: string;
  private handler: CronHandler;
  private options: ParserOptions<false>;

  private id?: ReturnType<typeof setTimeout>;

  constructor(
    expression: string,
    handler: CronHandler,
    options: ParserOptions<false> = { tz: "UTC+8" },
  ) {
    this.expression = expression;
    this.handler = handler;
    this.options = options;

    const now = +new Date();
    const ts = new Date(this.options.currentDate ?? now).getTime();
    const endDate = this.options.endDate
      ? new Date(this.options.endDate).getTime()
      : undefined;
    if (ts <= now) {
      this.start(endDate);
    } else {
      this.id = setTimeout(() => this.start(endDate), ts - now);
    }
  }

  private run(interval: CronExpression<false>) {
    const now = +new Date();
    try {
      const ts = interval.next().getTime();
      this.id = setTimeout(() => {
        this.run(interval);
        this.handler();
      }, ts - now);
      return true;
    } catch {
      this.options.endDate = now;
      return false;
    }
  }

  stop() {
    clearTimeout(this.id);
  }

  start(endDate?: number) {
    this.stop();
    try {
      const interval = parseExpression(this.expression, {
        ...this.options,
        currentDate: +new Date(),
        endDate,
      });
      return this.run(interval);
    } catch {
      return false;
    }
  }
}
