import { cors } from "serverless";

import { oak } from "deps";
import { expose } from "@eiko/serverless/mod.ts";
import { singleton } from "@eiko/shared/mod.ts";
import type { Example } from "../rss/mod.ts";

const APP = {};
export default expose(async (_ctx, req, lambda) => {
  const app = singleton(APP, () => {
    const router = new oak.Router()
      .use(cors("http://localhost:3000"))
      .get(
        "/example",
        (ctx) =>
          ctx.response.body = async () => {
            try {
              const resp = await lambda("rss")(
                "http://localhost/2json?url=https://acg.rip/.xml?term=Koumei",
              );
              const { rss: { rss } } = (await resp.json()) as Example;
              const { channel: { item } } = rss;
              return item
                .filter((item) =>
                  /【喵萌奶茶屋】(.*)派对浪客诸葛孔明(.*)1080(.*)简/.test(item.title)
                )
                .map((item) => ({
                  title: item.title,
                  pubDate: item.pubDate,
                  torrent: `${item.link}.torrent`,
                }));
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
    return app;
  });
  return await app.handle(req) ??
    new Response(null, { status: oak.Status.ServiceUnavailable });
});
