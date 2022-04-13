import { oak } from "deps";
import { expose } from "@eiko/serverless/mod.ts";
import { XMLParser } from "./deps.ts";
const parser = new XMLParser();

const router = new oak.Router()
  .get(
    "/2json",
    (ctx) =>
      ctx.response.body = async () => {
        try {
          // const resp = await fetch("https://does.not.exist/");
          // const resp = await fetch("https://acg.rip/.xml?term=Koumei");
          const url = ctx.request.url.searchParams.get("url");
          // console.log("debug3", "url", url);
          if (!url) return { url };
          const now = +new Date();
          const resp = await fetch(url);
          const xml = String(await resp.text());
          console.log("debug3", "xml", +new Date() - now);
          return { url, rss: parser.parse(xml) };
        } catch (e) {
          console.error("catch", e);
          // ctx.response.status = oak.Status.InternalServerError;
        }
        return {};
      },
  );

const app = new oak.Application();
app.use(router.routes());
app.use(router.allowedMethods());

export default expose(async (_ctx, req) => {
  return await app.handle(req) ??
    new Response(null, { status: oak.Status.ServiceUnavailable });
});
