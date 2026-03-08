#!/bin/sh
set -e

CERT="/etc/letsencrypt/live/${DOMAIN}/fullchain.pem"
AVAILABLE="/etc/nginx/available"
CONF_DIR="/etc/nginx/conf.d"
RELOAD_FLAG="/var/nginx-reload/.reload"

apply_config() {
  local config_file="$1"
  envsubst '$DOMAIN' < "${AVAILABLE}/${config_file}" > "${CONF_DIR}/app.conf"
}

# nginx 기본 설정 제거
rm -f /etc/nginx/conf.d/default.conf

# 인증서 존재 여부에 따라 설정 선택
if [ -f "$CERT" ]; then
  echo "[nginx] SSL 인증서 발견 → HTTPS 설정으로 시작"
  apply_config "app.https.conf"
else
  echo "[nginx] SSL 인증서 없음 → HTTP 설정으로 시작 (certbot-init 실행 필요)"
  apply_config "app.http.conf"
fi

# nginx 시작 (백그라운드)
nginx -g "daemon off;" &
NGINX_PID=$!

# certbot 갱신 신호 감시 루프
while kill -0 $NGINX_PID 2>/dev/null; do
  if [ -f "$RELOAD_FLAG" ]; then
    rm -f "$RELOAD_FLAG"
    echo "[nginx] 인증서 갱신 감지 → HTTPS 설정으로 전환 후 reload"
    apply_config "app.https.conf"
    nginx -s reload
  fi
  sleep 30
done

wait $NGINX_PID
