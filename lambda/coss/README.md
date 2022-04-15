# coss(cloud object storage service)

- https://github.com/P3TERX/aria2.conf
- 测试资源
  - https://blog.csdn.net/fhl13017599952/article/details/116190107
  - https://blog.csdn.net/xia296/article/details/118651949

## images

```bash
# https://hub.docker.com/r/p3terx/aria2-pro
docker run -d \
  --name aria2-pro \
  --restart unless-stopped \
  --log-opt max-size=1m \
  -e RPC_SECRET=123456 \
  -e RPC_PORT=6800 \
  -p 6800:6800 \
  -v $PWD/aria2-config:/config \
  -v $PWD/eiko/downloads:/downloads \
  p3terx/aria2-pro

# https://www.gaoxiaobo.com/web/service/134.html
# on-download-complete=hook.sh
curl --location --request POST 'http://<user>:<pass>@<host>:<port>/api/coss/aria2/complete' \
    --header 'Content-Type: application/json' \
    --data-raw "{\"id\":\"$1\",\"name\":\"$3\"}"
# e.g
curl --location --request POST 'http://test:123456@eiko:8080/api/coss/aria2/complete' \
    --header 'Content-Type: application/json' \
    --data-raw "{\"id\":\"$1\",\"name\":\"$3\"}"
```
