import { Resource, ResourceManager } from "./resource.ts";

export class AcgRipRM extends ResourceManager {
  async search(): Promise<Resource[]> {
    if (this.name === "test") {
      return [{
        title: "test",
        pubDate: +new Date(),
        url: "http://172.23.8.160:8383/eiko/coss/default/a%20b.txt",
      }];
    }
    const url = new URL("http://lambda/2json");
    url.searchParams.set("url", `https://acg.rip/.xml?term=${this.name}`);
    const resp = await this.lambda("rss")(url.toString());
    const { rss: { rss } } = (await resp.json()) as Example;
    const { channel: { item } } = rss;
    return item.map((item) => ({
      title: item.title,
      pubDate: +new Date(item.pubDate),
      url: `${item.link}.torrent`,
    }));
  }
}

type Example = typeof example;
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
