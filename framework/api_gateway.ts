// API Gateway
import { oak } from "deps";
import {
  define,
  RawResponse,
  RawServerless,
  Services,
  toRawRequest,
} from "@eiko/serverless/mod.ts";
import { run } from "@eiko/worker/mod.ts";
import { select, sleep } from "@eiko/shared/mod.ts";

const buildServiceOptions = (svrName: string) => ({
  // TODO: hot reload
  load: async () => {
    console.log("加载 serverless", svrName);
    const url = new URL(
      `../lambda/${svrName}/mod.ts`,
      import.meta.url,
    );
    const svr = await run<RawServerless>(
      url,
      {
        namespace: true,
        permissions: "inherit",
      },
    );
    if (!svr) return;
    const { remote, terminate } = svr;
    console.log("加载 serverless", svrName, "完成");
    return {
      handler: remote.handler,
      onUnload: async () => {
        await remote.onUnload();
        terminate();
      },
    };
  },
});

export const newApiGateway = (prefix = "/api") => {
  const services = new Services(buildServiceOptions);
  services.register("manager", {
    load: () => {
      const router = new oak.Router()
        .get("/list", (ctx) => {
          const list = services.list();
          ctx.response.body = { list };
        })
        .get("/timeout", async (ctx) => {
          await sleep(10 * 1000);
          ctx.response.body = "timeout";
        })
        .get("/reload/:svr", async (ctx) => {
          const svr = ctx.params.svr;
          const isSucc = await services.register(svr, buildServiceOptions(svr));
          ctx.response.body = `reload ${svr} ${isSucc ? "success" : "fail"}`;
        })
        .all("(.*)?", (ctx) => {
          ctx.response.body = ctx.request.url;
        });

      const app = new oak.Application();
      app.use(router.routes());
      app.use(router.allowedMethods());

      return define(async (_ctx, req) =>
        await app.handle(req) ??
          new Response(null, { status: oak.Status.ServiceUnavailable })
      );
    },
  });

  return new oak.Router().all(`${prefix}/:svr/(.*)?`, (ctx) => {
    const svrName = ctx.params.svr;
    return select(
      // TODO: timeout option
      // [sleep(10000), () => ctx.response.status = oak.Status.GatewayTimeout],
      [
        (async () => {
          const url = new URL(ctx.request.url.toString());
          url.pathname = url.pathname.replace(`${prefix}/${svrName}`, "");
          console.log("请求 serverless", svrName);
          return await services.handle(
            svrName,
            await toRawRequest(
              url.toString(),
              {
                method: ctx.request.method,
                headers: ctx.request.headers,
                body: await ctx.request.body({ type: "bytes" }).value,
              },
            ),
          );
        })(),
        (resp: RawResponse) => {
          console.log("请求 serverless", svrName, "完成");
          ctx.response.status = resp.status ?? 200;
          Object.entries(resp.headers ?? {}).forEach(([k, v]) =>
            ctx.response.headers.append(k, v)
          );
          ctx.response.body = resp.body;
        },
      ],
    );
  });
};
