# Flash Sale Backend — Space-Based Architecture

## Kiến trúc

```
┌─────────────────────────────────────────────────────┐
│                   Frontend (React)                   │
│                    port: 3000                        │
└──────┬──────────┬──────────┬──────────┬─────────────┘
       │          │          │          │
       ▼          ▼          ▼          ▼
  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
  │  PU1   │ │  PU2   │ │  PU3   │ │  PU4   │
  │Product │ │  Cart  │ │ Order  │ │Inventory│
  │ :8081  │ │ :8082  │ │ :8083  │ │ :8084  │
  └────┬───┘ └────┬───┘ └────┬───┘ └────┬───┘
       │          │          │          │
       └──────────┴──────────┴──────────┘
                        │
              ┌─────────▼──────────┐
              │   Data Grid        │
              │   Redis :6379      │
              │  (Shared Memory)   │
              └────────────────────┘
```

## Cài đặt

```bash
cd BE
npm install
```

## Khởi động

### 1. Chạy Redis (Docker)
```bash
docker run -d --name redis-datagrid -p 6379:6379 redis:7-alpine
```

Hoặc cài Redis trực tiếp:
```bash
# macOS
brew install redis && brew services start redis

# Ubuntu
sudo apt install redis-server && sudo systemctl start redis
```

### 2. Seed dữ liệu vào Data Grid
```bash
npm run seed
```

### 3. Chạy tất cả Processing Units
```bash
npm start
# hoặc chạy từng PU riêng:
npm run pu1   # Product  :8081
npm run pu2   # Cart     :8082
npm run pu3   # Order    :8083
npm run pu4   # Inventory:8084
```

## API Endpoints

### PU1 — Product (port 8081)
| Method | Path | Mô tả |
|--------|------|-------|
| GET | /products | Danh sách sản phẩm từ Redis |
| GET | /products/:id | Chi tiết sản phẩm + stock real-time |

### PU2 — Cart (port 8082)
| Method | Path | Mô tả |
|--------|------|-------|
| GET | /cart?userId=xxx | Lấy giỏ hàng từ Redis |
| POST | /cart/add | Thêm vào giỏ `{ userId, productId, quantity }` |
| DELETE | /cart/:productId | Xoá item `{ userId }` |
| DELETE | /cart/clear | Xoá toàn bộ giỏ `{ userId }` |

### PU3 — Order (port 8083)
| Method | Path | Mô tả |
|--------|------|-------|
| POST | /checkout | Đặt hàng, giảm stock, xoá cart |
| GET | /orders/:userId | Lịch sử đơn hàng |

### PU4 — Inventory (port 8084)
| Method | Path | Mô tả |
|--------|------|-------|
| GET | /stock/:productId | Tồn kho real-time |
| GET | /stock | Tất cả tồn kho |
| POST | /stock/decrease | Giảm stock `{ productId, quantity }` |
| POST | /stock/increase | Tăng stock (restock) |

## Biến môi trường

```env
REDIS_HOST=127.0.0.1   # IP máy chạy Redis
REDIS_PORT=6379
PU1_PORT=8081
PU2_PORT=8082
PU3_PORT=8083
PU4_PORT=8084
```

## Triển khai LAN (nhiều máy)

Mỗi người chạy 1 PU trên máy của mình:

| Service | IP | Port |
|---------|-----|------|
| Redis (Data Grid) | 192.168.x.x | 6379 |
| PU1 – Product | 192.168.x.x | 8081 |
| PU2 – Cart | 192.168.x.x | 8082 |
| PU3 – Order | 192.168.x.x | 8083 |
| PU4 – Inventory | 192.168.x.x | 8084 |
| Frontend | 192.168.x.x | 3000 |

Đặt `REDIS_HOST=<IP máy chạy Redis>` trong env của từng PU.

## Luồng đặt hàng (Space-Based Flow)

```
User → FE → PU2 (add to cart → Redis)
         → PU3 (checkout):
              1. Lấy cart từ Redis
              2. DECRBY stock trên Redis (atomic)
              3. Lưu order vào Redis
              4. Xoá cart
              5. Trả kết quả NGAY (không chờ DB)
```
