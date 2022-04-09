import { oak } from "deps";
import { expose } from "@eiko/serverless/mod.ts";

const router = new oak.Router()
  .get("/", (ctx) => ctx.response.body = { code: 0, msg: "foo" })
  .get("/bar", (ctx) => ctx.response.body = { code: 0, msg: "fooBar" });

const app = new oak.Application();
app.use(router.routes());
app.use(router.allowedMethods());

export default expose(async (_ctx, req) => {
  return await app.handle(req) ??
    new Response(null, { status: oak.Status.ServiceUnavailable });
});
