// deno-lint-ignore-file no-explicit-any

export interface Context {
  deadline(): Date | undefined;
  done(): Promise<void>; // AbortSignal;
  err(): Error | undefined;
  value(key: any): any;
}

export const ERR_CANCELED = new Error("context canceled");
export const ERR_DEADLINE_EXCEEDED = new Error("context deadline exceeded");

class SimpleContext implements Context {
  protected controller = new AbortController();
  protected parent?: SimpleContext;
  constructor(parent?: Context) {
    this.parent = parent as SimpleContext | undefined;
    const signal = this.parent?.controller.signal;
    if (!signal) return;
    const handler = () => this.controller.abort(signal.reason);
    signal.addEventListener("abort", handler);
    this.controller.signal.addEventListener(
      "abort",
      () => signal.removeEventListener("abort", handler),
    );
  }
  deadline(): Date | undefined {
    return this.parent?.deadline();
  }
  done() {
    return new Promise<void>((r) =>
      this.controller.signal.addEventListener("abort", () => r())
    );
  }

  err() {
    return this.controller.signal.reason as Error | undefined;
  }
  value(key: any): any {
    return this.parent?.value(key);
  }
}

export const background = (): Context => new SimpleContext();

export const withValue = (ctx: Context, key: any, val: any) =>
  new class extends SimpleContext {
    value(k: any) {
      return k === key ? val : super.parent?.value(key);
    }
  }(ctx);

class WithCancel extends SimpleContext {
  cancel() {
    this.controller.abort(ERR_CANCELED);
  }
}
export const withCancel = (ctx: Context) => new WithCancel(ctx);

export type DateLike = Date | number;
export class WithDeadline extends WithCancel {
  private ts: number;
  constructor(parent: Context, time: DateLike) {
    super(parent);
    const deadline = parent.deadline();
    const ts = +time;
    if (deadline && +deadline <= ts) {
      this.ts = +deadline;
      return;
    }
    this.ts = ts;
    setTimeout(
      () => this.controller.abort(ERR_DEADLINE_EXCEEDED),
      this.ts - (+new Date()),
    );
  }
  deadline() {
    return new Date(this.ts);
  }
}
export const withDeadline = (ctx: Context, time: DateLike) =>
  new WithDeadline(ctx, time);
export const withTimeout = (ctx: Context, ms: number) =>
  withDeadline(ctx, +new Date() + ms);
