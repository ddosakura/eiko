const id = "f6b18011-f71e-4780-bae6-01736b15fdb5";
const pwd = "/storage/coss/bangumi";
await Deno.mkdir(`${pwd}/hls/${id}`, { recursive: true });
const p = Deno.run({
  cmd:
    `ffmpeg -i ${pwd}/${id} -c:v libx264 -hls_time 10 -hls_list_size 0 -c:a aac -strict -2 -f hls ${pwd}/hls/${id}/index.m3u8`
      .split(" "),
});
await p.status();
