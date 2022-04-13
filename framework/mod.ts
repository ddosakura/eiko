import { basicAuth, loadSecrets, oak } from "deps";
import { newApiGateway } from "./api_gateway.ts";
import { logger, timing } from "./logger.ts";

const { mongo: { user, pass } } = await loadSecrets();
export const serve = async (
  port: number,
  webPath: string,
  storagePath: string,
) => {
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
    // 临时认值手段
    const unauthorized = basicAuth(
      new Request("http://auth", { headers: ctx.request.headers }),
      "Access to my site",
      {
        [user]: pass,
      },
    );
    if (unauthorized) {
      ctx.response.status = unauthorized.status;
      ctx.response.headers.set(
        "www-authenticate",
        unauthorized.headers.get("www-authenticate")!,
      );
      return;
    }
    // 此处不 await 会导致 `app Error: The response is not writable.`
    await next();
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
  const webRoot = webPath.startsWith("/")
    ? webPath
    : `${Deno.cwd()}/${webPath}`;
  const storageRoot = storagePath.startsWith("/")
    ? storagePath
    : `${Deno.cwd()}/${storagePath}`;
  app.use(async (ctx, next) => {
    try {
      if (ctx.request.url.pathname.startsWith("/storage")) {
        // TODO: acl
        const path = ctx.request.url.pathname.replace("/storage", "/coss");
        console.log(path, storageRoot);
        await ctx.send({ root: storageRoot, path });
        return;
      }
      await ctx.send({ root: webRoot, index: "index.html" });
    } catch {
      next();
    }
  });
  await app.listen({ port });
};
