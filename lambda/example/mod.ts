import { define } from "@eiko/serverless/mod.ts";

export default define((_ctx, req) =>
  router
    .get("/", (ctx) => ctx.response.body = { code: 0, msg: "foo" })
    .get("/bar", (ctx) => ctx.response.body = { code: 0, msg: "fooBar" })
);
