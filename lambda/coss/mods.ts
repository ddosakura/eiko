import { oak } from "deps";
import { expose } from "@eiko/serverless/mod.ts";
import { Aria2 } from "./deps.ts";

const aria2 = new Aria2({
  host: "localhost",
  port: 6800,
  secure: false,
  secret: "",
  path: "/jsonrpc",
});

// TODO: /storage

const router = new oak.Router()
  // aria2c --enable-rpc --rpc-listen-all=true --rpc-allow-origin-all
  .get("/aria2", async (ctx) => {
    // const magnet =
    //   "magnet:?xt=urn:btih:88594AAACBDE40EF3E2510C47374EC0AA396C08E&dn=bbb_sunflower_1080p_30fps_normal.mp4&tr=udp%3a%2f%2ftracker.openbittorrent.com%3a80%2fannounce&tr=udp%3a%2f%2ftracker.publicbt.com%3a80%2fannounce&ws=http%3a%2f%2fdistribution.bbb3d.renderfarming.net%2fvideo%2fmp4%2fbbb_sunflower_1080p_30fps_normal.mp4";
    const magnet =
      "magnet:?xt=urn:btih:88594AAACBDE40EF3E2510C47374EC0AA396C08E";
    const [guid] = await aria2.call("addUri", [magnet], { dir: "/tmp" });
    ctx.response.body = { guid };
  })
  .get("/unzip", (ctx) => ctx.response.body = {});

const app = new oak.Application();
app.use(router.routes());
app.use(router.allowedMethods());

export default expose(async (_ctx, req) => {
  return await app.handle(req) ??
    new Response(null, { status: oak.Status.ServiceUnavailable });
});
