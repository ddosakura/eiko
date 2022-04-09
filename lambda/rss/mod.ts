import { cors } from "serverless";

import { oak } from "deps";
import { expose } from "@eiko/serverless/mod.ts";
import { XMLParser } from "./deps.ts";
const parser = new XMLParser();

const router = new oak.Router()
  .use(cors("http://localhost:3000"))
  .get(
    "/2json",
    (ctx) =>
      ctx.response.body = async () => {
        try {
          // const resp = await fetch("https://does.not.exist/");
          // const resp = await fetch("https://acg.rip/.xml?term=Koumei");
          const url = ctx.request.url.searchParams.get("url");
          console.log("debug3", "url", url);
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
  )
  .get(
    "/example",
    (ctx) =>
      ctx.response.body = () => {
        return { rss: example };
      },
  );

const app = new oak.Application();
app.use(router.routes());
app.use(router.allowedMethods());

export default expose(async (_ctx, req) => {
  return await app.handle(req) ??
    new Response(null, { status: oak.Status.ServiceUnavailable });
});

const example = {
  "url": "https://acg.rip/.xml?term=Koumei",
  "rss": {
    "?xml": "",
    "rss": {
      "channel": {
        "title": "ACG.RIP",
        "description": "ACG.RIP has super cow power",
        "link": "https://acg.rip/.xml?term=Koumei",
        "ttl": 1800,
        "item": [{
          "title":
            "[NC-Raws] 派对浪客诸葛孔明 / Paripi Koumei (Ya Boy Kongming!) - 02 (B-Global 1920x1080 HEVC AAC MKV)",
          "description":
            '<div style="text-align:center;"><img src="https://s2.loli.net/2022/04/07/iW3R7o2nEgcXVhx.jpg" alt="" /></div><br />\n<div style="text-align:center;">Watch on Telegram Channel: <a href="https://t.me/...',
          "pubDate": "Thu, 07 Apr 2022 07:01:30 -0700",
          "link": "https://acg.rip/t/253274",
          "guid": "https://acg.rip/t/253274",
          "enclosure": "",
        }, {
          "title":
            "[喵萌奶茶屋&LoliHouse] 派对浪客诸葛孔明 / 派对咖孔明 / Paripi Koumei / Ya Boy Kongming - 01 [WebRip 1080p HEVC-10bit AAC][简繁日内封字幕]",
          "description":
            '<img src="https://p.sda1.dev/5/03fd176a86b9c18923e8773ac7ebf7b1/kongming_1000.jpg" alt="" /><br />\n<br />\n<strong>派对浪客诸葛孔明 / 派对咖孔明 / Paripi Koumei / Ya Boy Kongming <br />\n</strong><br />\n<strong>字...',
          "pubDate": "Mon, 04 Apr 2022 02:31:41 -0700",
          "link": "https://acg.rip/t/253116",
          "guid": "https://acg.rip/t/253116",
          "enclosure": "",
        }, {
          "title":
            "【喵萌奶茶屋】★04月新番★[派對浪客諸葛孔明/派對咖孔明/Paripi Koumei/Ya Boy Kongming][01][1080p][繁體][招募翻譯校對]",
          "description":
            '<img src="https://p.sda1.dev/5/03fd176a86b9c18923e8773ac7ebf7b1/kongming_1000.jpg" alt="" /><br />\n<br />\n<img src="https://www.kanjiantu.com/image/aYGzlU" alt="" /><br />\n喵萌奶茶屋招募以下职位的小伙伴！<br />\n1....',
          "pubDate": "Mon, 04 Apr 2022 01:46:24 -0700",
          "link": "https://acg.rip/t/253114",
          "guid": "https://acg.rip/t/253114",
          "enclosure": "",
        }, {
          "title":
            "【喵萌奶茶屋】★04月新番★[派對浪客諸葛孔明/派對咖孔明/Paripi Koumei/Ya Boy Kongming][01][720p][繁體][招募翻譯校對]",
          "description":
            '<img src="https://p.sda1.dev/5/03fd176a86b9c18923e8773ac7ebf7b1/kongming_1000.jpg" alt="" /><br />\n<br />\n<img src="https://www.kanjiantu.com/image/aYGzlU" alt="" /><br />\n喵萌奶茶屋招募以下职位的小伙伴！<br />\n1....',
          "pubDate": "Mon, 04 Apr 2022 01:44:59 -0700",
          "link": "https://acg.rip/t/253113",
          "guid": "https://acg.rip/t/253113",
          "enclosure": "",
        }, {
          "title":
            "【喵萌奶茶屋】★04月新番★[派对浪客诸葛孔明/派对咖孔明/Paripi Koumei/Ya Boy Kongming][01][1080p][简体][招募翻译校对]",
          "description":
            '<img src="https://p.sda1.dev/5/03fd176a86b9c18923e8773ac7ebf7b1/kongming_1000.jpg" alt="" /><br />\n<br />\n<img src="https://www.kanjiantu.com/image/aYGzlU" alt="" /><br />\n喵萌奶茶屋招募以下职位的小伙伴！<br />\n1....',
          "pubDate": "Sun, 03 Apr 2022 04:14:10 -0700",
          "link": "https://acg.rip/t/253061",
          "guid": "https://acg.rip/t/253061",
          "enclosure": "",
        }, {
          "title":
            "【喵萌奶茶屋】★04月新番★[派对浪客诸葛孔明/派对咖孔明/Paripi Koumei/Ya Boy Kongming][01][720p][简体][招募翻译校对]",
          "description":
            '<img src="https://p.sda1.dev/5/03fd176a86b9c18923e8773ac7ebf7b1/kongming_1000.jpg" alt="" /><br />\n<br />\n<img src="https://www.kanjiantu.com/image/aYGzlU" alt="" /><br />\n喵萌奶茶屋招募以下职位的小伙伴！<br />\n1....',
          "pubDate": "Sun, 03 Apr 2022 04:13:52 -0700",
          "link": "https://acg.rip/t/253060",
          "guid": "https://acg.rip/t/253060",
          "enclosure": "",
        }, {
          "title":
            "[NC-Raws] 派对浪客诸葛孔明 / Paripi Koumei (Ya Boy Kongming!) - 01 (B-Global 1920x1080 HEVC AAC MKV)",
          "description":
            '<div style="text-align:center;"><img src="https://s2.loli.net/2022/03/31/KSCeRgjbAYr49dh.jpg" alt="" /></div><br />\n<div style="text-align:center;">Watch on Telegram Channel: <a href="https://t.me/...',
          "pubDate": "Thu, 31 Mar 2022 07:01:52 -0700",
          "link": "https://acg.rip/t/252924",
          "guid": "https://acg.rip/t/252924",
          "enclosure": "",
        }],
      },
    },
  },
};
