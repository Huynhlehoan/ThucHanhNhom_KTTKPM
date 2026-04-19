#!/bin/bash
# ============================================================
# Demo Scale — Clone PU1 (Product) thành 2 instance
# Middleware tự round-robin giữa 2 PU1
# ============================================================

LAN_IP=$(ipconfig getifaddr en0 2>/dev/null || hostname -I 2>/dev/null | awk '{print $1}')

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║     FLASH SALE — SCALE DEMO (Clone PU)              ║"
echo "╠══════════════════════════════════════════════════════╣"
echo "║  PU1-A (Product) :8081                              ║"
echo "║  PU1-B (Product) :8091  ← clone                    ║"
echo "║  PU2   (Cart)    :8082                              ║"
echo "║  PU3   (Order)   :8083                              ║"
echo "║  PU4   (Inventory):8084                             ║"
echo "║  Middleware      :8080  (load balance PU1-A/B)      ║"
echo "╠══════════════════════════════════════════════════════╣"
echo "║  IP: $LAN_IP"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

node shared/seed.js

echo "🚀 Starting scaled services..."

PU1_PORT=8081 node pu1-product/index.js &
PU1_PORT=8091 node pu1-product/index.js &   # Clone PU1
PU2_PORT=8082 node pu2-cart/index.js &
PU3_PORT=8083 node pu3-order/index.js &
PU4_PORT=8084 node pu4-inventory/index.js &
SCALE_MODE=true node virtualization-middleware/index.js

wait
