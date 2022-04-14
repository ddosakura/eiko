import { oak } from "deps";
import { expose as e, proxy } from "@eiko/worker/mod.ts";

export * from "./utils.ts";
import {
  RawRequest,
  RawResponse,
  toRawRequest,
  toRawResponse,
  toResponse,
} from "./utils.ts";

// deno-lint-ignore no-explicit-any
export type Context = Record<string, any>;

export type Lambda = (
  input: RequestInfo,
  init?: RequestInit,
) => Promise<Response>;

export type Handler = (
  context: Context,
  request: Request,
  lambda: Lambda,
) => Promise<Response | string>;
export type RawHandler = (
  context: Context,
  request: RawRequest,
  lambda: (req: RawRequest) => Promise<RawResponse>,
) => Promise<RawResponse>;

// === define ===

export interface Serverless {
  handler: Handler;
  onUnload: () => Promise<void>;
}
export interface RawServerless {
  handler: RawHandler;
  onUnload: () => Promise<void>;
}

export type HandlerOrServerless = Handler | Serverless;

export const define = (handler: HandlerOrServerless): RawServerless => {
  const serverless = typeof handler === "function"
    ? { handler, onUnload: async () => {} }
    : handler;
  return {
    ...serverless,
    handler: async (ctx, { url, ...opts }, lambda) => {
      try {
        const body = await serverless.handler(
          ctx,
          new Request(url, opts),
          async (input: RequestInfo, init?: RequestInit) => {
            const resp = await lambda(
              await toRawRequest(new Request(input, init)),
            );
            return toResponse(resp);
          },
        );
        return toRawResponse(body);
      } catch {
        return {
          status: oak.Status.InternalServerError,
          body: new TextEncoder().encode(`服务崩溃`),
        };
      }
    },
  };
};
// const data = new Uint8Array([1, 2, 3, 4, 5]);
// await myProxy.someFunction(Comlink.transfer(data, [data.buffer]));
export const expose = (s: HandlerOrServerless) => e(define(s));

// === register ===

export interface Service {
  serve: (context: Context) => void;
  unload: () => void;
}

export interface ServiceOptions {
  load: () => Promise<RawServerless | undefined> | RawServerless | undefined;
}

export class Services {
  private services = new Map<string, RawServerless>();
  private getOptions: (svr: string) => ServiceOptions;
  constructor(getOptions: (svr: string) => ServiceOptions) {
    this.getOptions = getOptions;
  }

  list() {
    return Array.from(this.services.entries())
      .map(([name]) => ({ name }));
  }

  async handle(
    svr: string,
    request: RawRequest,
    rawOptions?: ServiceOptions,
  ): Promise<RawResponse> {
    const options = rawOptions ?? this.getOptions(svr);
    try {
      if (!this.services.has(svr)) {
        const serverless = await options.load();
        if (!serverless) {
          return {
            status: oak.Status.BadGateway,
            body: new TextEncoder().encode(`svr[${svr}] NotFound`),
          };
        }
        this.services.set(svr, serverless);
      }
      const s = this.services.get(svr)!;
      const context = {};
      return await s.handler(
        context,
        request,
        proxy(async (req: RawRequest) => {
          const url = new URL(req.url);
          if (!url.host.endsWith(".lambda")) {
            return toRawResponse(await fetch(url.toString()));
          }
          const svr = url.host.replace(/\.lambda$/, "");
          url.host = "lambda";
          const now = +new Date();
          const resp = await this.handle(svr, req);
          console.log(req.method, req.url, "-", +new Date() - now, "ms");
          return resp;
        }),
      );
    } catch {
      // console.error("catch", e);
      return {
        status: oak.Status.InternalServerError,
      };
    }
  }

  unregister(svr: string) {
    const service = this.services.get(svr);
    if (!service) return;
    service.onUnload();
    this.services.delete(svr);
  }

  async register(svr: string, rawOptions?: ServiceOptions) {
    const options = rawOptions ?? this.getOptions(svr);
    this.unregister(svr);
    const serverless = await options.load();
    serverless && this.services.set(svr, serverless);
    return !!serverless;
  }
}
