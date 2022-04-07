import { oak, OakResponseBody } from "deps";

// === define ===

export type Handler<Context> = (ctx: Context, router: oak.Router) => oak.Router;

export interface Serverless<Context> {
  onLoad: Handler<Context>;
  onUnload?: Handler<Context>;
}

export type LoaderOrServerless<Context> =
  | Handler<Context>
  | Serverless<Context>;

export const defineServerless = <Context = Record<string, any>>(
  opts: LoaderOrServerless<Context>,
): Serverless<Context> => typeof opts === "function" ? { onLoad: opts } : opts;

// === register ===

export interface Service {
  serve: (ctx: oak.RouterContext<any>) => void;
  unload: () => void;
}

export class Services {
  private services = new Map<string, Service>();
  constructor() {}

  list() {
    return Array.from(this.services.entries())
      .map(([name]) => ({ name }));
  }

  getService(svr: string) {
    return this.services.get(svr);
  }

  register(svr: string, serverless: Serverless<any>) {
    this.unregister(svr);
    const context: any = {};
    const router = new oak.Router({ prefix: `/api/${svr}` })
      .use(async (ctx, next) => {
        try {
          await next();
        } catch (err) {
          console.error(`svr[${svr}]`, err);
          // ctx.throw(oak.Status.InternalServerError, `svr[${svr}]`)
          if (!ctx.response.writable) return;
          ctx.response.status = oak.Status.InternalServerError;
          return ctx.response.body = {
            svr,
            status: oak.Status.InternalServerError,
            errMsg: oak.STATUS_TEXT.get(oak.Status.InternalServerError),
          };
        }
      });
    serverless.onLoad(context, router);
    router.all("(.*)?", (ctx) => {
      ctx.response.status = oak.Status.NotFound;
      ctx.response.body = {
        svr,
        status: oak.Status.NotFound,
        errMsg: oak.STATUS_TEXT.get(oak.Status.NotFound),
      };
    });
    this.services.set(svr, {
      serve: (ctx) => router.routes()(ctx, async () => {}),
      unload: () => serverless.onUnload?.(context, router),
    });
  }

  unregister(svr: string) {
    const service = this.services.get(svr);
    if (!service) return;
    service.unload();
    this.services.delete(svr);
  }
}

// === utils ===

export const safeHandler = <Path extends string>(
  handler: (ctx: oak.RouterContext<Path>) => Promise<OakResponseBody>,
): oak.RouterMiddleware<Path> =>
  (ctx) =>
    ctx.response.body = async () => {
      try {
        return await handler(ctx);
      } catch (err) {
        ctx.response.status = oak.Status.InternalServerError;
        return {
          status: oak.Status.InternalServerError,
          errMsg: oak.STATUS_TEXT.get(oak.Status.InternalServerError),
        };
      }
    };
