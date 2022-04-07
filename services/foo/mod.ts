import { defineServerless } from "serverless";

export default defineServerless((_ctx, router) =>
  router
    .get("/", (ctx) => ctx.response.body = { code: 0, msg: "foo" })
    .get("/bar", (ctx) => ctx.response.body = { code: 0, msg: "fooBar" })
);
