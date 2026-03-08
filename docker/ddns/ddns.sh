#!/bin/sh
# Namecheap Dynamic DNS 자동 갱신 스크립트 (5분마다)
# Namecheap → Advanced DNS → Dynamic DNS → Enable 후 Password를 NAMECHEAP_DDNS_PASSWORD에 설정

apk add --no-cache curl 2>/dev/null

INTERVAL=300  # 5분

echo "[ddns] Namecheap DDNS 갱신 시작 (도메인: ${DDNS_DOMAIN}, 간격: ${INTERVAL}초)"

update() {
  RESPONSE=$(curl -s "https://dynamicdns.park-your-domain.com/update?host=@&domain=${DDNS_DOMAIN}&password=${DDNS_PASSWORD}")
  if echo "$RESPONSE" | grep -q "<ErrCount>0</ErrCount>"; then
    echo "[ddns] $(date '+%Y-%m-%d %H:%M:%S') 갱신 성공"
  else
    echo "[ddns] $(date '+%Y-%m-%d %H:%M:%S') 갱신 실패: $RESPONSE"
  fi
}

# 시작 즉시 1회 갱신
update

# 이후 주기적 갱신
while true; do
  sleep $INTERVAL
  update
done
