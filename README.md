# [Koumei Project](https://github.com/ddosakura/koumei) Eiko Services

基于 deno 的 serverless 框架及 [Koumei Project](https://github.com/ddosakura/koumei)
所需的服务

## QuickStart

1. 安装依赖

```bash
./install.sh
```

2. 安装 vscode 插件

- deno

3. 配置 aria2

```bash
# script/clean.sh
curl --location --request POST "http://test:123456@eiko:8080/api/coss/aria2/complete?debug=$1" \
    --header 'Content-Type: application/json' \
    --data-raw "{\"id\":\"$1\",\"name\":\"$3\"}"

# script/core
CLEAN_UP() {
    DELETE_DOT_ARIA2
    # DELETE_DOT_TORRENT
    DELETE_EXCLUDE_FILE
    DELETE_EMPTY_DIR
}
```

### 运行主服务

_具体参数可能发生变化，参见 dev.sh/pre.sh_

```bash
docker run -it --init \
  -p 80:8080
  -v $(pwd):/app -w /app
  denoland/deno:1.20.4 run \
  --import-map=/app/import_map.json --allow-net --allow-read \
  index.ts 8080 static
```

### docker-compose 部署

1. 安装 docker-compose

```bash
sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

sudo chmod +x /usr/local/bin/docker-compose

docker-compose --version
```

2. 拉取仓库

```bash
git clone https://github.com/ddosakura/eiko.git

# 上传or构建 https://github.com/ddosakura/koumei.git

# in ~/ws/koumeiproject
ln -s $PWD/koumei /koumeiproject/koumei
```

3. 服务部署与关闭

```bash
# in ~/ws/koumeiproject/eiko

docker-compose up -d
docker-compose down

docker exec -it <container_id> /bin/bash
docker logs -f --tail 20 <container_id>

# 运行eiko
```

### (optional) Add deno alias to your shell

```bash
# https://hub.docker.com/r/denoland/deno
# ~/.bashrc or ~/.zshrc
deno () {
  docker run \
    --interactive \
    --tty \
    --rm \
    --volume $PWD:/app \
    --volume $HOME/.deno:/deno-dir \
    --workdir /app \
    denoland/deno:1.20.4 \
    "$@"
}

source ~/.bashrc
deno --version
deno run ./main.ts
```

## Framework Feature

- Registering Routes Dynamically
- File Server
- middlewares
  - cors

## TODO List

- framework: hot reload (worker + bundle + nocheck)
- framework: acl
- framework: cron trigger
- framework: logger to db
- service: user&db
- service: aria2
- service: coss(cloud object storage service)
- service: cas(cloud archive service)
- https://deno.land/x/zx_deno
- graphql

### for bangumi

- series
- oakd lambda
  - delete c/r with coss
  - 指定 sync
  - 重切
- svr acl&对外可见性
- hot reload
- image: zsh&终端中文
- 切片任务下发

## mongo-express

```bash
# 有问题
docker run -it --rm \
    --network eiko-romantic_chatelet_default \
    --name mongo-express \
    -p 8081:8081 \
    -e ME_CONFIG_SITE_BASEURL="/mongo" \
    -e ME_CONFIG_OPTIONS_EDITORTHEME="ambiance" \
    -e ME_CONFIG_MONGODB_ADMINUSERNAME="root" \
    -e ME_CONFIG_MONGODB_ADMINPASSWORD="123456" \
    mongo-express:1.0.0-alpha.4

# 可行
docker run -it --rm \
    --network eiko-romantic_chatelet_default \
    --name mongo-express \
    -p 8081:8081 \
    -e ME_CONFIG_MONGODB_URL=mongodb://root:123456@mongo:27017 \
    -e ME_CONFIG_BASICAUTH_USERNAME="root" \
    -e ME_CONFIG_BASICAUTH_PASSWORD="123456" \
    mongo-express:1.0.0-alpha.4

# example
docker run -it --rm \
    --network eiko-romantic_chatelet_default \
    --name mongo-express \
    -p 8081:8081 \
    -e ME_CONFIG_MONGODB_URL=mongodb://root:123456@mongo:27017 \
    mongo-express:1.0.0-alpha.4

# CLI
docker run -it --rm --network eiko-romantic_chatelet_default mongo:5.0.6 \
    mongo --host mongo \
    -u root \
    -p 123456 \
    --authenticationDatabase admin \
    some-db
```
