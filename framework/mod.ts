import { oak } from "deps";
import { newApiGateway } from "./api_gateway.ts";
import { newFileServer } from "./file_server.ts";
import { logger, timing } from "./logger.ts";

export const serve = async (port: number, path: string) => {
  const app = new oak.Application();
  app.addEventListener("listen", ({ hostname, port, secure }) => {
    console.log(
      `Listening on: ${secure ? "https://" : "http://"}${
        hostname ??
          "localhost"
      }:${port}`,
    );
  });
  app.use(async (ctx, next) => {
    try {
      await next();
    } catch (err) {
      console.log("app", err);
      if (!ctx.response.writable) return;
      ctx.response.status = oak.Status.InternalServerError;
      ctx.response.body = {
        status: oak.Status.InternalServerError,
        errMsg: oak.STATUS_TEXT.get(oak.Status.InternalServerError),
      };
    }
  });
  app.use(logger, timing);
  app.use(newApiGateway().routes());
  app.use(newFileServer(path.startsWith('/') ? path : `${Deno.cwd()}/${path}`));
  await app.listen({ port });
};
