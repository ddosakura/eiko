import { oak, OakResponseBody } from "deps";

// === utils ===

export * from "./middlewares.ts";

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
