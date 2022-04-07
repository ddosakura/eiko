import { defineServerless, safeHandler } from "serverless";
import { XMLParser } from "./deps.ts";
const parser = new XMLParser();

export default defineServerless((_ctx, router) =>
  router.get("/2json", safeHandler(async (ctx) => {
    // const resp = await fetch("https://does.not.exist/");
    // const resp = await fetch("https://acg.rip/.xml?term=Koumei");
    const url = ctx.request.url.searchParams.get("url");
    if (!url) return { url };
    const resp = await fetch(url);
    const xml = String(await resp.text());
    return { url, rss: parser.parse(xml) };
  }))
);
