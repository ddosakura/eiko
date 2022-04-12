# coss(cloud object storage service)

- https://github.com/P3TERX/aria2.conf

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
curl --location --request POST 'http://test2:123456@172.23.8.160:8088/api/coss/aria2/complete' \
    --header 'Content-Type: application/json' \
    --data-raw "{\"id\":\"$1\",\"name\":\"$3\"}"
```
