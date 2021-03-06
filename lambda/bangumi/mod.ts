import { loadSecrets, MongoClient, oak, ObjectId } from "deps";
import { expose } from "@eiko/serverless/mod.ts";
import { singleton } from "@eiko/shared/mod.ts";
import { CollectionSchema, ResourceSchema } from "./resource.ts";
import { AcgRipRM } from "./acg.rip.ts";

const { mongo: { user, pass } } = await loadSecrets();
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
      .get("/collection", async (ctx) => {
        const name = ctx.request.url.searchParams.get("name");
        const searchKey = ctx.request.url.searchParams.get("key");
        const reFilter = ctx.request.url.searchParams.get("filter");
        if (!name || !searchKey || !reFilter) {
          return ctx.response.body = {
            name,
            searchKey,
            reFilter,
          };
        }
        const collection: Partial<CollectionSchema> = {
          name,
          searchKey,
          reFilter,
        };
        ctx.response.body = await collections
          .updateOne(
            { name: collection.name },
            { $set: collection },
            { upsert: true },
          );
      })
      .delete("/collection", async (ctx) => {
        const id = ctx.request.url.searchParams.get("id");
        if (!id) return ctx.response.body = {};
        const coss = !!ctx.request.url.searchParams.get("coss");
        const _id = new ObjectId(id);
        if (coss) {
          // TODO: 清理coss资源
        }
        ctx.response.body = {
          collections: await collections.deleteOne({ _id }),
          resources: await resources.deleteMany({ cid: _id }),
        };
      })
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
        const cursor = collections.find(undefined, { sort: { _id: -1 } });
        cursor.skip((page - 1) * size).limit(size);
        const list = await cursor.toArray();
        ctx.response.body = { total, list };
      })
      .get("/resources", async (ctx) => {
        const page = parseInt(
          ctx.request.url.searchParams.get("page") ?? "1",
          10,
        );
        const size = parseInt(
          ctx.request.url.searchParams.get("size") ?? "10",
          10,
        );
        const total = await resources.countDocuments();
        const cursor = resources.find(undefined, { sort: { _id: -1 } });
        cursor.skip((page - 1) * size).limit(size);
        const list = await cursor.toArray();
        ctx.response.body = { total, list };
      })
      .get("/resources/:cid", async (ctx) => {
        const cid = ctx.params.cid;
        const page = parseInt(
          ctx.request.url.searchParams.get("page") ?? "1",
          10,
        );
        const size = parseInt(
          ctx.request.url.searchParams.get("size") ?? "10",
          10,
        );
        const total = await resources.countDocuments({
          cid: new ObjectId(cid),
        });
        const cursor = resources.find({ cid: new ObjectId(cid) }, {
          sort: { _id: -1 },
        });
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
        const latest = ctx.request.url.searchParams.get("latest");
        const num = latest ? parseInt(latest, 0) : undefined;
        if (!name) return ctx.response.body = { name };
        const collection = await collections.findOne({ name });
        if (!collection) return ctx.response.body = { name };

        const list = (await search(
          collection.searchKey,
          new RegExp(collection.reFilter),
        )).map((item) => ({ ...item, cid: collection._id }));

        const syncList = await (async () => {
          const oldLatest = await resources.findOne({ cid: collection._id }, {
            sort: { pubDate: -1 },
          });
          if (!oldLatest) {
            return latest ? list.slice(0, num) : list;
          }
          // 增量更新
          const newList = list.filter((item) =>
            item.pubDate > oldLatest.pubDate
          );
          return latest ? newList.slice(0, num) : newList;
        })();
        if (syncList.length === 0) {
          return ctx.response.body = { name, msg: "Not Need Sync" };
        }

        const url = new URL("http://coss.lambda/aria2");
        syncList.forEach((item) => url.searchParams.append("url", item.url));
        url.searchParams.set("hls", "true");
        url.searchParams.set("bucket", "bangumi");
        url.searchParams.set("cb", `http://bangumi.lambda/sync/done`);
        const resp = await lambda(url.toString());
        const aria2Ids: Record<string, string> = await resp.json();
        // const aria2Ids: Record<string, string> = {};

        const aria2List = syncList.map((item) => ({
          ...item,
          aria2Id: aria2Ids[item.url],
        }));
        await resources.insertMany(aria2List);
        ctx.response.body = {
          name,
          list: aria2List,
        };
      })
      .get("/sync/done", async (ctx) => {
        const aria2Id = ctx.request.url.searchParams.get("id");
        if (!aria2Id) return ctx.response.body = {};
        const hls = !!ctx.request.url.searchParams.get("hls");
        const cossId = ctx.request.url.searchParams.get("cossId");
        if (hls) {
          if (!cossId) return ctx.response.body = {};
          const result = await resources.updateOne(
            { aria2Id },
            // { $set: { hls: { [cossId]: true } } },
            { $set: { [`hls.${cossId}`]: true } },
          );
          return ctx.response.body = result;
        }
        const files: Record<string, string> = JSON.parse(
          ctx.request.url.searchParams.get("files") ?? "{}",
        );
        const result = await resources.updateOne(
          { aria2Id },
          // { $set: { files } },
          {
            $set: Object.fromEntries(
              Object.entries(files)
                .map(([k, v]) => [`files.${k}`, v]),
            ),
          },
        );
        ctx.response.body = result;
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
          const fitler = ctx.request.url.searchParams.get("fitler") ?? ".*";
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
