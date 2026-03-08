#!/bin/sh
# Let's Encrypt 인증서 자동 갱신 스크립트 (75일 = 2개월 + 2주)
trap exit TERM

while :; do
  sleep 6480000 & wait ${!}
  certbot renew --webroot -w /var/www/certbot --quiet \
    --deploy-hook 'touch /var/nginx-reload/.reload'
done
