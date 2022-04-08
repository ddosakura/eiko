# [Koumei Project](https://github.com/ddosakura/koumei) Eiko Services

基于 deno 的 serverless 框架及 [Koumei Project](https://github.com/ddosakura/koumei) 所需的服务

## ## QuickStart

```bash
docker run -it --init \
  -p 80:8080
  -v $(pwd):/app -w /app
  denoland/deno:1.20.4 run \
  --import-map=/app/import_map.json --allow-net --allow-read \
  index.ts 8080 static
```

## Framework Feature

+ Registering Routes Dynamically
+ File Server
+ middlewares
  + cors

## TODO List

+ framework: hot reload
+ framework: cron trigger
+ framework: logger to db
+ service: user&db
