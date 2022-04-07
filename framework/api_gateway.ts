// API Gateway
import { oak } from "deps";
import { defineServerless, Services } from "./serverless.ts";

const load = async (services: Services, svrName: string) => {
  const svr = services.getService(svrName);
  if (svr) return svr;
  try {
    const { default: serverless } = await import(
      `../services/${svrName}/mod.ts`
    );
    services.register(svrName, serverless);
    return services.getService(svrName);
  } catch (err) {
    console.error(`gateway`, err);
    return;
  }
};

export const newApiGateway = (prefix = "/api") => {
  const services = new Services();
  services.register(
    "manager",
    defineServerless((_ctx, router) =>
      router.get("/status", (ctx) => {
        const list = services.list();
        ctx.response.body = { code: 0, list };
      })
    ),
  );

  return new oak.Router()
    .all(`${prefix}/:svr/(.*)?`, async (ctx) => {
      const svrName = ctx.params.svr;
      const svr = await load(services, svrName);
      if (!svr) {
        ctx.response.status = oak.Status.NotFound;
        return ctx.response.body = {
          status: oak.Status.NotFound,
          errMsg: `svr[${svrName}] Not Found`,
        };
      }
      svr.serve(ctx);
    });
};
