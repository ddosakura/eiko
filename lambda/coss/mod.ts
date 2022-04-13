import { oak } from "deps";
import { singleton } from "@eiko/shared/mod.ts";
import { expose } from "@eiko/serverless/mod.ts";
import { Pool } from "@eiko/pool/mod.ts";

// import { Aria2 } from "./deps.ts";

const RPC_URL = "http://aria2:6800/jsonrpc";
const RPC_SECRET = "123456"; // aria2-pro 配不了 `/run/secrets/`
// https://www.gaoxiaobo.com/web/service/134.html
// https://github1s.com/sonnyp/aria2.js/blob/HEAD/src/JSONRPCClient.js
// https://aria2.github.io/manual/en/html/index.html
const aria2c = async (urls: string[]) => {
  // id：请求中的id和返回值中的id相对应，其实http接口这个id意义不大，主要是websocket中用于对应返回值和哪个请求相匹配
  // 返回值result：相当于aria2中的下载任务id
  const id = crypto.randomUUID();
  const body = {
    jsonrpc: "2.0",
    method: "aria2.addUri",
    id,
    params: [`token:${RPC_SECRET}`, urls, { dir: "/downloads" }],
  };
  const resp = await fetch(RPC_URL, {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });
  const data: {
    id: string;
    jsonrpc: "2.0";
    result: string;
  } = await resp.json();
  return data.result;
};
const tellStatus = async (id: string) => {
  const body = {
    jsonrpc: "2.0",
    method: "aria2.tellStatus",
    id,
    params: [`token:${RPC_SECRET}`, id],
  };
  const resp = await fetch(RPC_URL, {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });
  const data: {
    id: string;
    jsonrpc: "2.0";
    result: {
      followedBy: string[];
    };
  } = await resp.json();
  return data.result.followedBy;
};

// TODO: 之后再入数据库
const aria2Cache = new Map<
  string,
  { cb?: string; bucket: string; hls: boolean; id: string }
>();

const APP = {};
export default expose(async (_ctx, req, lambda) => {
  const onAria2Complete = async (id: string, name: string) => {
    if (!id || !name) return;
    const cache = aria2Cache.get(id);
    if (!cache) return;

    // TODO: 确认能不能删
    // aria2Cache.delete(id);
    // 跟踪种子文件
    if (name.endsWith(".torrent")) {
      const followedBy = await tellStatus(id);
      followedBy.forEach((fid) => aria2Cache.set(fid, cache));
      return { id, followedBy };
    }

    const { cb, bucket, hls } = cache;
    // mount /storage/downloads to aria2's /downloads
    const origin = `/storage/${name}`;
    const stat = await Deno.stat(origin);
    const files = new Map<string, string>();
    if (stat.isFile) {
      const id = crypto.randomUUID();
      // TODO: 目录+id防止同名文件冲突
      files.set(id, name.replace("/downloads", ""));
      await Deno.rename(
        origin,
        `/storage/coss/${bucket}/${id}`,
      );
    } else {
      // TODO: 多文件
    }
    if (files.size === 0) return { id, rawId: cache.id, name, files };

    if (cb) {
      const url = new URL(cb);
      url.searchParams.set("id", cache.id);
      url.searchParams.set(
        "files",
        JSON.stringify(Object.fromEntries(files.entries())),
      );
      // TODO: 统一化
      if (url.host.endsWith(".lambda")) {
        const svr = url.host.replace(/\.lambda$/, "");
        url.host = "lambda";
        await lambda(svr)(url.toString());
      } else {
        await fetch(url.toString());
      }
    }

    // 仅切片MP4文件
    if (hls && name.toLocaleLowerCase().endsWith(".mp4")) {
      files.forEach((_, cossId) => {
        runHls(bucket, cossId, async () => {
          if (cb) {
            const url = new URL(cb);
            url.searchParams.set("id", cache.id);
            url.searchParams.set("cossId", cossId);
            url.searchParams.set("hls", "true");
            if (url.host.endsWith(".lambda")) {
              const svr = url.host.replace(/\.lambda$/, "");
              url.host = svr;
              await lambda(svr)(url.toString());
            } else {
              await fetch(url.toString());
            }
          }
        });
      });
    }

    return { id, rawId: cache.id, name, files };
  };
  const app = singleton(APP, () => {
    const router = new oak.Router()
      // aria2c --enable-rpc --rpc-listen-all=true --rpc-allow-origin-all
      .get("/aria2", async (ctx) => {
        // const magnet =
        //   "magnet:?xt=urn:btih:88594AAACBDE40EF3E2510C47374EC0AA396C08E&dn=bbb_sunflower_1080p_30fps_normal.mp4&tr=udp%3a%2f%2ftracker.openbittorrent.com%3a80%2fannounce&tr=udp%3a%2f%2ftracker.publicbt.com%3a80%2fannounce&ws=http%3a%2f%2fdistribution.bbb3d.renderfarming.net%2fvideo%2fmp4%2fbbb_sunflower_1080p_30fps_normal.mp4";

        const urls = ctx.request.url.searchParams.getAll("url");
        const hls = ctx.request.url.searchParams.get("hls") === "true";
        const bucket = ctx.request.url.searchParams.get("bucket") ?? "default";
        const cb = ctx.request.url.searchParams.get("cb") ?? undefined;
        const promises = urls.map(async (url) => {
          const guid = await aria2c([url]);
          aria2Cache.set(guid, { cb, bucket, hls, id: guid });
          return [url, guid as string] as const;
        });
        ctx.response.body = Object.fromEntries(await Promise.all(promises));
      })
      // /api/coss/aria2:complete?id="$1"&name="$3"
      .get("/aria2:complete", async (ctx) => {
        const id = ctx.request.url.searchParams.get("id") ?? "";
        const name = ctx.request.url.searchParams.get("name") ?? "";
        ctx.response.body = (await onAria2Complete(id, name)) ?? { id, name };
      })
      .post("/aria2/complete", async (ctx) => {
        const { id, name } = await ctx.request.body({ type: "json" }).value ??
          {};
        ctx.response.body = (await onAria2Complete(id, name)) ?? { id, name };
      })
      .get("/hls", async (ctx) => {
        const bucket = ctx.request.url.searchParams.get("bucket") ?? "default";
        const id = ctx.request.url.searchParams.get("id");
        if (!id) return ctx.response.body = { id };
        ctx.response.body = await runHls(bucket, id);
      })
      .get("/hls/status", (ctx) => {
        const running = hlsPool.getRunning();
        const waiting = hlsPool.getWaiting();
        ctx.response.body = { running, waiting };
      })
      .get("/unzip", (ctx) => ctx.response.body = {});

    const app = new oak.Application();
    app.use(router.routes());
    app.use(router.allowedMethods());
    return app;
  });
  return await app.handle(req) ??
    new Response(null, { status: oak.Status.ServiceUnavailable });
});

// deno-lint-ignore ban-types
const hlsCache = new Map<string, {}>();
const hlsPool = new Pool(2);
const runHls = async (bucket: string, id: string, cb?: () => void) => {
  const key = `[${bucket}] ${id}`;
  if (!hlsCache.has(key)) {
    const hlsParams =
      "-c:v libx264 -hls_time 10 -hls_list_size 0 -c:a aac -strict -2 -f hls";
    const pwd = `/storage/coss/${bucket}`;
    // https://deno.land/manual@v1.20.5/examples/subprocess
    await Deno.mkdir(`${pwd}/hls/${id}`, { recursive: true });

    hlsCache.set(key, {});
    const task = async () => {
      const p = Deno.run({
        // cmd: [
        //   "deno",
        //   "run",
        //   "--allow-read",
        //   "https://deno.land/std@0.134.0/examples/cat.ts",
        //   "README.md",
        // ],
        // cmd: [
        //   "echo",
        //   `ffmpeg -i ${pwd}/${id} ${hlsParams} ${pwd}/hls/${id}/index.m3u8`,
        // ],
        cmd: `ffmpeg -i ${pwd}/${id} ${hlsParams} ${pwd}/hls/${id}/index.m3u8`
          .split(" "),
        stdout: "piped",
      });
      const { code } = await p.status();
      if (code !== 0) return;
      cb?.();
      hlsCache.delete(key);
    };
    hlsPool.run(key, task);
  }
  return hlsCache.has(key) ? "running or waiting" : "no task";
};
