import { oak } from "deps";

export const cors = (
  origin: string | ((ctx: oak.Context) => string),
): oak.Middleware => {
  const originFn = typeof origin === "string" ? (() => origin) : origin;
  return async (ctx, next) => {
    ctx.response.headers.set("Access-Control-Allow-Origin", originFn(ctx));
    await next();
  };
};
