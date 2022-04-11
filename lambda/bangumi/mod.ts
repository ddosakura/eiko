import { cors } from "serverless";

import { MongoClient, oak } from "deps";
import { expose } from "@eiko/serverless/mod.ts";
import { singleton } from "@eiko/shared/mod.ts";
import { CollectionSchema, ResourceSchema } from "./resource.ts";
import { AcgRipRM } from "./acg.rip.ts";

const user = await Deno.readTextFile("/run/secrets/mongo-user");
const pass = await Deno.readTextFile("/run/secrets/mongo-pass");
const client = new MongoClient();
await client.connect(`mongodb://${user}:${pass}@mongo:27017`);
const db = client.database("lambda-bangumi");
const resources = db.collection<ResourceSchema>("resources");
const collections = db.collection<CollectionSchema>("collections");

const APP = {};
export default expose(async (_ctx, req, lambda) => {
  const search = async (name: string, filter?: RegExp) => {
    const rm = new AcgRipRM(name, lambda);
    const list = await rm.search();
    if (!filter) return list;
    return list.filter((item) => filter.test(item.title));
  };
  const app = singleton(APP, () => {
    const router = new oak.Router()
      .use(cors("http://localhost:3000"))
      .get("/collections", async (ctx) => {
        const page = parseInt(
          ctx.request.url.searchParams.get("page") ?? "1",
          10,
        );
        const size = parseInt(
          ctx.request.url.searchParams.get("size") ?? "10",
          10,
        );
        const total = await collections.countDocuments();
        const cursor = collections.find();
        cursor.skip((page - 1) * size).limit(size);
        const list = await cursor.toArray();
        ctx.response.body = { total, list };
      })
      // TODO: post & impl
      // .get("/collection", async (ctx) => {
      //   const collection: Partial<CollectionSchema> = {
      //     name: "派对浪客诸葛孔明",
      //     searchKey: "派对浪客诸葛孔明",
      //     reFilter: "【喵萌奶茶屋】(.*)派对浪客诸葛孔明(.*)1080(.*)简",
      //   };
      //   ctx.response.body = await collections
      //     .updateOne(
      //       { name: collection.name },
      //       { $set: collection },
      //       { upsert: true },
      //     );
      // })
      .get("/sync", async (ctx) => {
        const name = ctx.request.url.searchParams.get("name");
        if (!name) return ctx.response.body = { name };
        const collection = await collections.findOne({ name });
        if (!collection) return ctx.response.body = { name };

        const list = (await search(
          collection.searchKey,
          new RegExp(collection.reFilter),
        )).map((item) => ({ ...item, cid: collection._id, sync: false }));

        const syncList = await (async () => {
          const latest = await resources.findOne({ cid: collection._id }, {
            sort: { pubDate: 1 },
          });
          if (!latest) return list;
          // 增量更新
          return list.filter((item) => item.pubDate > latest.pubDate);
        })();

        await resources.insertMany(syncList);
        // TODO: call aria2c
        // TODO: cb change sync from false to true

        ctx.response.body = syncList;
      })
      .get(
        "/search",
        async (ctx) => {
          // ctx.response.body = async () => {
          //   try {
          //     const rm = new AcgRipRM("Koumei", lambda);
          //     const list = await rm.search();
          //     return list.filter((item) =>
          //       /【喵萌奶茶屋】(.*)派对浪客诸葛孔明(.*)1080(.*)简/.test(item.title)
          //     );
          //   } catch (e) {
          //     console.error("catch", e);
          //     // ctx.response.status = oak.Status.InternalServerError;
          //   }
          //   return {};
          // }
          const name = ctx.request.url.searchParams.get("name");
          const fitler = ctx.request.url.searchParams.get("fitler");
          if (!name) return ctx.response.body = { name };
          ctx.response.body = await search(
            name,
            fitler ? new RegExp(fitler) : undefined,
          );
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
