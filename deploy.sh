#!/bin/bash

# ==============================================================================
# SCRIPT DEPLOYMENT BAYYINAH AI KE VPS
# - Rsync kode ke VPS
# - pg_dump dari lokal → restore ke VPS (via Docker)
# - Install deps & restart PM2
# ==============================================================================

set -e  # Hentikan script jika ada error

# ──────────────────────────────────────────────
# KONFIGURASI — sesuaikan jika perlu
# ──────────────────────────────────────────────
VPS_USER="root"
VPS_HOST="187.77.117.72"
VPS_DIR="/root/bayyinah"

# Konfigurasi DB lokal (dari .env)
LOCAL_DB_USER="user"
LOCAL_DB_PASS="password"
LOCAL_DB_NAME="islamic_rag"
LOCAL_DB_HOST="localhost"
LOCAL_DB_PORT="5432"

# Konfigurasi DB di VPS (sesuai docker-compose.yml)
VPS_DB_CONTAINER="islamic_rag_db"
VPS_DB_USER="user"
VPS_DB_PASS="password"
VPS_DB_NAME="islamic_rag"

DUMP_FILE="/tmp/bayyinah_db_$(date +%Y%m%d_%H%M%S).dump"

# ──────────────────────────────────────────────
# STEP 1: pg_dump dari database lokal
# ──────────────────────────────────────────────
echo ""
echo "📦 [1/5] Membuat dump database dari lokal..."
PGPASSWORD="$LOCAL_DB_PASS" pg_dump \
  -h "$LOCAL_DB_HOST" \
  -p "$LOCAL_DB_PORT" \
  -U "$LOCAL_DB_USER" \
  -d "$LOCAL_DB_NAME" \
  --no-owner \
  --no-acl \
  -F c \
  -f "$DUMP_FILE"

echo "✅ Dump selesai: $DUMP_FILE"

# ──────────────────────────────────────────────
# STEP 2: Rsync kode ke VPS
# ──────────────────────────────────────────────
echo ""
echo "🚀 [2/5] Sinkronisasi kode ke VPS ($VPS_USER@$VPS_HOST:$VPS_DIR)..."
rsync -avzP \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude '.DS_Store' \
  --exclude 'dist' \
  --exclude '*.log' \
  --exclude '/tmp' \
  ./ "$VPS_USER@$VPS_HOST:$VPS_DIR"

echo "✅ Sinkronisasi file selesai."

# ──────────────────────────────────────────────
# STEP 3: Kirim file dump ke VPS
# ──────────────────────────────────────────────
echo ""
echo "📤 [3/5] Mengirim file dump ke VPS..."
scp "$DUMP_FILE" "$VPS_USER@$VPS_HOST:/tmp/bayyinah_db.dump"
echo "✅ File dump terkirim ke VPS."

# Hapus dump lokal setelah selesai
rm -f "$DUMP_FILE"

# ──────────────────────────────────────────────
# STEP 4: Setup Docker DB & restore dump di VPS
# ──────────────────────────────────────────────
echo ""
echo "🐳 [4/5] Setup Docker & restore database di VPS..."
ssh "$VPS_USER@$VPS_HOST" bash <<REMOTE_EOF
  set -e

  echo "  → Masuk ke direktori project..."
  cd "$VPS_DIR"

  echo "  → Memastikan Docker & Docker Compose terinstall..."
  if ! command -v docker &>/dev/null; then
    echo "  ⚙️  Menginstall Docker..."
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
  fi

  if ! docker compose version &>/dev/null; then
    echo "  ⚙️  Menginstall Docker Compose plugin..."
    apt-get install -y docker-compose-plugin 2>/dev/null || \
      curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 \
        -o /usr/local/bin/docker-compose && chmod +x /usr/local/bin/docker-compose
  fi

  echo "  → Menjalankan container database..."
  docker compose up -d db

  echo "  → Menunggu PostgreSQL siap (max 30 detik)..."
  for i in \$(seq 1 30); do
    if docker exec "$VPS_DB_CONTAINER" pg_isready -U "$VPS_DB_USER" -d "$VPS_DB_NAME" &>/dev/null; then
      echo "  ✅ PostgreSQL siap!"
      break
    fi
    echo "  ... tunggu \$i/30"
    sleep 1
  done

  echo "  → Restore dump ke container PostgreSQL..."
  # Salin dump ke dalam container
  docker cp /tmp/bayyinah_db.dump "$VPS_DB_CONTAINER":/tmp/bayyinah_db.dump

  # Drop & recreate database agar restore bersih
  docker exec "$VPS_DB_CONTAINER" psql -U "$VPS_DB_USER" -c "DROP DATABASE IF EXISTS ${VPS_DB_NAME};" postgres
  docker exec "$VPS_DB_CONTAINER" psql -U "$VPS_DB_USER" -c "CREATE DATABASE ${VPS_DB_NAME};" postgres

  # Restore
  docker exec "$VPS_DB_CONTAINER" pg_restore \
    -U "$VPS_DB_USER" \
    -d "$VPS_DB_NAME" \
    --no-owner \
    --no-acl \
    -v \
    /tmp/bayyinah_db.dump

  echo "  ✅ Database berhasil di-restore!"

  # Bersihkan file dump di VPS
  rm -f /tmp/bayyinah_db.dump
  docker exec "$VPS_DB_CONTAINER" rm -f /tmp/bayyinah_db.dump

REMOTE_EOF

# ──────────────────────────────────────────────
# STEP 5: Install deps & jalankan dengan PM2
# ──────────────────────────────────────────────
echo ""
echo "⚡ [5/5] Install dependensi & restart PM2..."
ssh "$VPS_USER@$VPS_HOST" bash <<REMOTE_EOF2
  set -e
  cd "$VPS_DIR"

  echo "  → Memastikan Node.js & npm terinstall..."
  if ! command -v node &>/dev/null; then
    echo "  ⚙️  Menginstall Node.js LTS..."
    curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
    apt-get install -y nodejs
  fi

  echo "  → Memastikan PM2 terinstall..."
  if ! command -v pm2 &>/dev/null; then
    npm install -g pm2
  fi

  echo "  → Install npm dependencies..."
  npm install --production

  echo "  → Restart aplikasi dengan PM2..."
  pm2 delete bayyinah 2>/dev/null || true
  pm2 start npm --name "bayyinah" -- run start
  pm2 save
  pm2 startup systemd -u root --hp /root 2>/dev/null || true

  echo "  ✅ Aplikasi berjalan!"
  pm2 status

REMOTE_EOF2

echo ""
echo "🎉 =============================================================="
echo "   Deployment Bayyinah AI selesai!"
echo "   App  : http://$VPS_HOST:3000"
echo "   DB   : PostgreSQL di Docker container '$VPS_DB_CONTAINER'"
echo "   Log  : ssh $VPS_USER@$VPS_HOST 'pm2 logs bayyinah'"
echo "=================================================================="
