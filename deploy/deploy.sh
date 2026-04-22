#!/bin/bash
set -e
set -o pipefail

DOMAIN="lyceum64study.ru"
WWW_DOMAIN="www.lyceum64study.ru"
LETSENCRYPT_EMAIL="admin@lyceum64study.ru"
APP_DIR="/opt/ly64"
APP_USER="ly64"
PG_USER="ly64"
PG_DB="ly64"
PG_PASS="mCUI0JgAYqKMo5c0Q9CY0WqpOvKc1xkc"
JWT_SECRET="af8dfc1724ccd2d52521d08ade4ee24d244848c27a04d883f9fbc0fee5a2f96cad1b7de4003dc74aa25801b0498d0527ff8c8fc4eb9f3d491f7e3903e6cce8bc"
BACKEND_PORT=3001
SRC_ARCHIVE="/root/ly64-src.tar.gz"

export DEBIAN_FRONTEND=noninteractive

log() { printf "\n\e[1;36m==> %s\e[0m\n" "$*"; }

log "1/13  System update"
apt-get update -qq
apt-get upgrade -y -qq

log "2/13  Ensure swap (2G)"
if [ ! -f /swapfile ]; then
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile >/dev/null
  swapon /swapfile
  grep -q '/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
  echo 'vm.swappiness=10' > /etc/sysctl.d/99-swap.conf
  sysctl -p /etc/sysctl.d/99-swap.conf >/dev/null
fi
swapon --show

log "3/13  Install base packages"
apt-get install -y -qq curl ca-certificates gnupg build-essential git \
  nginx ufw postgresql postgresql-contrib \
  certbot python3-certbot-nginx rsync

log "4/13  Install Node.js 20.x"
if ! command -v node >/dev/null || [ "$(node -v | cut -d. -f1 | tr -d v)" -lt 20 ]; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y -qq nodejs
fi
node -v
npm -v

log "5/13  Firewall (ufw)"
ufw --force reset >/dev/null
ufw default deny incoming >/dev/null
ufw default allow outgoing >/dev/null
ufw allow OpenSSH >/dev/null
ufw allow 80/tcp >/dev/null
ufw allow 443/tcp >/dev/null
ufw --force enable >/dev/null
ufw status

log "6/13  PostgreSQL role + database"
systemctl enable --now postgresql
sudo -u postgres psql -v ON_ERROR_STOP=1 <<SQL
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname='${PG_USER}') THEN
    CREATE ROLE ${PG_USER} LOGIN PASSWORD '${PG_PASS}';
  ELSE
    ALTER ROLE ${PG_USER} WITH LOGIN PASSWORD '${PG_PASS}';
  END IF;
END
\$\$;
SQL
sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='${PG_DB}'" | grep -q 1 \
  || sudo -u postgres createdb -O ${PG_USER} ${PG_DB}
sudo -u postgres psql -v ON_ERROR_STOP=1 -d ${PG_DB} -c "GRANT ALL ON SCHEMA public TO ${PG_USER};"

log "7/13  App user + directory"
id -u "${APP_USER}" >/dev/null 2>&1 || useradd -r -m -d /home/${APP_USER} -s /bin/bash ${APP_USER}
mkdir -p ${APP_DIR}
chown -R ${APP_USER}:${APP_USER} ${APP_DIR}

log "8/13  Extract source to ${APP_DIR}"
if [ ! -f "${SRC_ARCHIVE}" ]; then
  echo "ERROR: ${SRC_ARCHIVE} not found. Upload it first via scp." >&2
  exit 1
fi
rm -rf ${APP_DIR}/backend ${APP_DIR}/frontend ${APP_DIR}/shared \
  ${APP_DIR}/package.json ${APP_DIR}/package-lock.json ${APP_DIR}/tsconfig.json || true
tar -xzf "${SRC_ARCHIVE}" -C ${APP_DIR}
chown -R ${APP_USER}:${APP_USER} ${APP_DIR}

log "9/13  Write backend .env"
cat > ${APP_DIR}/backend/.env <<ENV
PORT=${BACKEND_PORT}
NODE_ENV=production
DATABASE_URL=postgresql://${PG_USER}:${PG_PASS}@127.0.0.1:5432/${PG_DB}?schema=public
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://${DOMAIN}
ENV
chown ${APP_USER}:${APP_USER} ${APP_DIR}/backend/.env
chmod 600 ${APP_DIR}/backend/.env

log "10/13  Install dependencies + build"
sudo -u ${APP_USER} -H bash -lc "cd ${APP_DIR} && npm install --ignore-scripts --no-audit --no-fund"
# shared has no real build output but run to be safe; ignore failure
sudo -u ${APP_USER} -H bash -lc "cd ${APP_DIR} && npm run build --workspace=shared" || true
sudo -u ${APP_USER} -H bash -lc "cd ${APP_DIR}/backend && npx prisma generate"
sudo -u ${APP_USER} -H bash -lc "cd ${APP_DIR}/backend && npx prisma db push --accept-data-loss"
sudo -u ${APP_USER} -H bash -lc "cd ${APP_DIR} && npm run build --workspace=backend"
# Frontend build can spike memory: raise node heap
sudo -u ${APP_USER} -H bash -lc "cd ${APP_DIR} && NODE_OPTIONS=--max-old-space-size=1536 npm run build --workspace=frontend"

log "11/13  systemd service for backend"
cat > /etc/systemd/system/ly64-backend.service <<UNIT
[Unit]
Description=Lyceum 64 Backend API
After=network.target postgresql.service
Requires=postgresql.service

[Service]
Type=simple
User=${APP_USER}
Group=${APP_USER}
WorkingDirectory=${APP_DIR}/backend
Environment=NODE_ENV=production
EnvironmentFile=${APP_DIR}/backend/.env
ExecStart=/usr/bin/node dist/src/index.js
Restart=on-failure
RestartSec=3
StandardOutput=append:/var/log/ly64-backend.log
StandardError=append:/var/log/ly64-backend.log
LimitNOFILE=65535

[Install]
WantedBy=multi-user.target
UNIT
touch /var/log/ly64-backend.log
chown ${APP_USER}:${APP_USER} /var/log/ly64-backend.log
systemctl daemon-reload
systemctl enable ly64-backend
systemctl restart ly64-backend
sleep 3
systemctl --no-pager --full status ly64-backend | head -20

log "12/13  Nginx reverse proxy"
rm -f /etc/nginx/sites-enabled/default
cat > /etc/nginx/sites-available/ly64 <<NGINX
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN} ${WWW_DOMAIN};

    client_max_body_size 10M;

    root ${APP_DIR}/frontend/dist;
    index index.html;

    gzip on;
    gzip_types text/css application/javascript application/json image/svg+xml;
    gzip_min_length 1024;

    location /api/ {
        proxy_pass http://127.0.0.1:${BACKEND_PORT};
        proxy_http_version 1.1;
        proxy_set_header Host              \$host;
        proxy_set_header X-Real-IP         \$remote_addr;
        proxy_set_header X-Forwarded-For   \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 60s;
    }

    location /ws {
        proxy_pass http://127.0.0.1:${BACKEND_PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade    \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host       \$host;
        proxy_read_timeout 3600s;
    }

    location ~* \.(?:js|css|woff2?|ttf|eot|svg|png|jpg|jpeg|gif|ico|webp)\$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
        try_files \$uri =404;
    }

    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
NGINX
ln -sf /etc/nginx/sites-available/ly64 /etc/nginx/sites-enabled/ly64
nginx -t
systemctl reload nginx

log "13/13  Let's Encrypt SSL"
certbot --nginx --non-interactive --agree-tos -m "${LETSENCRYPT_EMAIL}" \
  -d "${DOMAIN}" -d "${WWW_DOMAIN}" --redirect || {
    echo "!! certbot failed — check that DNS A-record of ${DOMAIN} points to this server"
    echo "   you can re-run:  certbot --nginx -d ${DOMAIN} -d ${WWW_DOMAIN}"
  }
systemctl reload nginx || true

log "DONE"
echo "Backend: systemctl status ly64-backend"
echo "Logs:    tail -f /var/log/ly64-backend.log"
echo "Try:     curl -I https://${DOMAIN}"
