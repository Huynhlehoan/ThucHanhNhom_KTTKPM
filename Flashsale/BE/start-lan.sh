#!/bin/bash
# ============================================================
# Script khởi động BE cho demo LAN nhiều máy
# Chạy: bash start-lan.sh
# ============================================================

# Lấy IP LAN của máy này
LAN_IP=$(ipconfig getifaddr en0 2>/dev/null || hostname -I 2>/dev/null | awk '{print $1}')

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║         FLASH SALE — Space-Based Architecture        ║"
echo "╠══════════════════════════════════════════════════════╣"
echo "║  IP máy này: $LAN_IP"
echo "╠══════════════════════════════════════════════════════╣"
echo "║  Các máy khác cần đổi FE/.env thành:                ║"
echo "║  VITE_MW_URL=http://$LAN_IP:8080"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

# Seed data
echo "🌱 Seeding Data Grid..."
node shared/seed.js

echo ""
echo "🚀 Khởi động tất cả Processing Units..."
npm start
