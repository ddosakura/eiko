import { oak } from "deps";
import { expose as e, transfer } from "@eiko/worker/mod.ts";

export type Context = Record<string, string>;
export type RawRequest = {
  url: string;
  method: string;
  headers: Record<string, string>;
};
export type RawResponse = {
  status: oak.Status;
  headers?: Record<string, string>;
  body?: Uint8Array;
};

export type Handler = (
  context: Context,
  request: Request,
) => Promise<Response | string>;
export type RawHandler = (
  context: Context,
  request: RawRequest,
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
    handler: async (ctx, { url, ...opts }) => {
      try {
        const body = await serverless.handler(ctx, new Request(url, opts));
        const resp = typeof body === "string" ? new Response(body) : body;
        const data = new Uint8Array(await resp.arrayBuffer()); // (await resp.body?.getReader().read())?.value;
        return {
          status: resp.status,
          headers: Object.fromEntries(resp.headers.entries()),
          body: data ? transfer(data, [data.buffer]) : undefined,
        };
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
  constructor() {}

  list() {
    return Array.from(this.services.entries())
      .map(([name]) => ({ name }));
  }

  async handle(
    svr: string,
    request: RawRequest,
    options: ServiceOptions,
  ): Promise<RawResponse> {
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
      return await s.handler(context, request);
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

  async register(svr: string, options: ServiceOptions) {
    this.unregister(svr);
    const serverless = await options.load();
    serverless && this.services.set(svr, serverless);
  }
}
