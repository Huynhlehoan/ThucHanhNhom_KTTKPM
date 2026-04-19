# Flash Sale — Space-Based Architecture
## Hướng dẫn đầy đủ: Chạy, Test, Giải thích

---

## MỤC LỤC
1. [Kiến trúc tổng quan](#1-kiến-trúc-tổng-quan)
2. [Giải thích từng thành phần](#2-giải-thích-từng-thành-phần)
3. [Tại sao không dùng CSDL](#3-tại-sao-không-dùng-csdl)
4. [Dữ liệu lưu ở đâu](#4-dữ-liệu-lưu-ở-đâu)
5. [Hướng dẫn chạy](#5-hướng-dẫn-chạy)
6. [Kịch bản test](#6-kịch-bản-test)
7. [Câu hỏi thường gặp](#7-câu-hỏi-thường-gặp)

---

## 1. Kiến trúc tổng quan

```
┌─────────────────────────────────────────────────────────────┐
│                    BROWSER (React :3000)                     │
│              Giao diện người dùng — tiếng Việt              │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP
                           ▼
┌─────────────────────────────────────────────────────────────┐
│           VIRTUALIZATION MIDDLEWARE (:8080)                  │
│  - Cổng vào duy nhất của hệ thống                           │
│  - Route request đến đúng Processing Unit                   │
│  - Load balancing (round-robin khi scale)                   │
│  - Log mọi request                                          │
└──────┬──────────┬──────────┬──────────┬─────────────────────┘
       │          │          │          │
       ▼          ▼          ▼          ▼
  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
  │  PU1   │ │  PU2   │ │  PU3   │ │  PU4   │
  │Product │ │  Cart  │ │ Order  │ │Inventory│
  │ :8081  │ │ :8082  │ │ :8083  │ │ :8084  │
  │        │ │        │ │        │ │        │
  │Local   │ │Local   │ │        │ │Local   │
  │Cache   │ │Cache   │ │        │ │Cache   │
  │ 30s    │ │ 60s    │ │        │ │  5s    │
  └────┬───┘ └────┬───┘ └────┬───┘ └────┬───┘
       │          │          │          │
       └──────────┴──────────┴──────────┘
                        │
           ┌────────────▼────────────┐
           │      DATA GRID          │
           │      Redis :6379        │
           │   (Shared Memory RAM)   │
           │                         │
           │  products (hash)        │
           │  stock:p1..p8 (string)  │
           │  cart:{userId} (hash)   │
           │  order:{id} (string)    │
           └────────────┬────────────┘
                        │ Pub/Sub
           ┌────────────▼────────────┐
           │    MESSAGING GRID       │
           │   Redis Pub/Sub         │
           │                         │
           │  order.created →        │
           │  stock.updated →        │
           └────────────┬────────────┘
                        │
           ┌────────────▼────────────┐
           │    ORDER WORKER         │
           │  (Async Queue Consumer) │
           │  - Gửi email xác nhận   │
           │  - Ghi analytics        │
           │  - Persist xuống DB     │
           └────────────┬────────────┘
                        │ async (không block)
           ┌────────────▼────────────┐
           │      DATA WRITER        │
           │   db/orders.json        │
           │   (Backup storage)      │
           └─────────────────────────┘
```

---

## 2. Giải thích từng thành phần

### 2.1 Virtualization Middleware (`BE/virtualization-middleware/index.js`)

**Là gì:** Cổng vào duy nhất của toàn hệ thống. FE chỉ biết địa chỉ của Middleware, không biết PU nào đang chạy ở đâu.

**Làm gì:**
- Nhận request từ FE
- Xem URL → route đến đúng PU
- Nếu PU chết → trả lỗi 502 ngay, không treo

**Bảng route:**
| URL | Đến PU nào |
|-----|-----------|
| `/products` | PU1 — Product |
| `/cart` | PU2 — Cart |
| `/checkout` | PU3 — Order |
| `/stock` | PU4 — Inventory |

**Scale:** Khi chạy `npm run start:scale`, PU1 có 2 instance (:8081 và :8091). Middleware tự luân phiên (round-robin) giữa 2 cái.

---

### 2.2 PU1 — Product Processing Unit (`BE/pu1-product/index.js`)

**Làm gì:** Cung cấp danh sách sản phẩm và chi tiết sản phẩm.

**Luồng xử lý:**
```
Request GET /products
    │
    ▼
Local Cache (RAM) còn không? ──YES──► Trả về ngay (< 1ms)
    │ NO
    ▼
Data Grid (Redis) có không? ──YES──► Lấy về, lưu cache, trả về
    │ NO
    ▼
Data Reader (db/products.json) ──► Lấy về, trả về
```

**Local Cache:** Lưu trong RAM của PU1, TTL 30 giây. Nghĩa là 30 giây chỉ hit Redis 1 lần, còn lại trả từ RAM.

**Messaging:** Lắng nghe event `stock.updated` từ Messaging Grid. Khi PU4 giảm stock → PU1 xóa cache → lần sau lấy stock mới từ Redis.

---

### 2.3 PU2 — Cart Processing Unit (`BE/pu2-cart/index.js`)

**Làm gì:** Quản lý giỏ hàng của từng user.

**Lưu ở đâu:** Redis Hash `cart:{userId}` — mỗi user có 1 hash riêng, TTL 24 giờ.

**Ví dụ Redis key:** `cart:user-123` chứa:
```
p1 → {"id":"p1","name":"Smartwatch","quantity":2,"flashPrice":199.99}
p3 → {"id":"p3","name":"AeroBook","quantity":1,"flashPrice":1099.99}
```

**Kiểm tra stock:** Trước khi add vào giỏ, PU2 hỏi Redis `stock:p1` — nếu hết hàng thì từ chối ngay.

---

### 2.4 PU3 — Order Processing Unit (`BE/pu3-order/index.js`)

**Làm gì:** Xử lý đặt hàng. Đây là PU quan trọng nhất.

**Luồng checkout (7 bước):**
```
1. Lấy cart từ Redis
2. Kiểm tra stock từng sản phẩm
3. Giảm stock atomic (Redis pipeline DECRBY)
4. Tạo order, lưu vào Redis
5. Publish event "order.created" → Messaging Grid
6. Xóa cart khỏi Redis
7. Trả kết quả NGAY cho user ← không chờ DB
   (Worker xử lý email/analytics/DB ở background)
```

**Tại sao trả ngay ở bước 7?** Vì user không cần chờ email được gửi hay DB được ghi. Họ chỉ cần biết đơn hàng đã được xác nhận.

---

### 2.5 PU4 — Inventory Processing Unit (`BE/pu4-inventory/index.js`)

**Làm gì:** Quản lý tồn kho real-time.

**SETNX Locking:** Khi giảm stock, dùng Redis `SET lock:stock:p1 1 NX EX 5` để khóa. Nếu 2 request cùng lúc muốn giảm stock p1, chỉ 1 cái được khóa, cái kia phải chờ hoặc retry. Tránh tình trạng oversell (bán nhiều hơn hàng có).

**Ví dụ:**
```
User A và User B cùng mua sản phẩm còn 1 cái
→ User A lấy được lock → giảm stock 1→0 → giải phóng lock
→ User B thử lấy lock → thành công → kiểm tra stock = 0 → từ chối
→ Kết quả: chỉ User A mua được, User B nhận lỗi "Hết hàng"
```

---

### 2.6 Data Grid — Redis

**Là gì:** Bộ nhớ dùng chung (shared memory) cho tất cả PU. Đây là trái tim của Space-Based Architecture.

**Lưu gì trong Redis:**
| Key | Kiểu | Nội dung |
|-----|------|---------|
| `products` | Hash | Toàn bộ thông tin sản phẩm |
| `stock:p1` | String | Số lượng tồn kho sản phẩm p1 |
| `cart:user-123` | Hash | Giỏ hàng của user-123 |
| `order:ORD-xxx` | String | Thông tin đơn hàng |
| `orders:user-123` | List | Danh sách orderId của user |
| `lock:stock:p1` | String | Lock khi đang giảm stock |
| `queue:orders` | List | Queue đơn hàng chờ xử lý |

---

### 2.7 Messaging Grid — Redis Pub/Sub

**Là gì:** Kênh giao tiếp async giữa các PU. PU không gọi trực tiếp nhau, mà publish/subscribe qua Redis.

**Events:**
| Event | Publisher | Subscriber | Tác dụng |
|-------|-----------|------------|---------|
| `order.created` | PU3 | PU4, Worker | PU4 log stock consumed, Worker xử lý email |
| `stock.updated` | PU3, PU4 | PU1 | PU1 xóa cache để lấy stock mới |

---

### 2.8 Local Cache (`BE/shared/localCache.js`)

**Là gì:** Bộ nhớ RAM riêng của từng PU (JavaScript Map). Không chia sẻ với PU khác.

**Tại sao cần?** Giảm số lần hit Redis. Nếu 1000 request/giây hỏi danh sách sản phẩm, không cần hỏi Redis 1000 lần — chỉ hỏi 1 lần mỗi 30 giây, còn lại trả từ RAM.

**TTL theo PU:**
- PU1 products: 30 giây (sản phẩm ít thay đổi)
- PU2 cart: 60 giây (giỏ hàng của user)
- PU4 stock: 5 giây (stock thay đổi liên tục)

---

### 2.9 Order Worker (`BE/order-worker/index.js`)

**Là gì:** Process chạy riêng, liên tục lấy order từ Queue và xử lý.

**Làm gì:**
- Gửi email xác nhận (simulate)
- Ghi analytics
- Persist order xuống `db/orders.json`

**Tại sao tách ra?** PU3 không cần chờ email được gửi. PU3 chỉ cần đẩy order vào Queue rồi trả kết quả ngay. Worker xử lý sau, không ảnh hưởng tốc độ.

---

### 2.10 Data Writer (`BE/shared/dataWriter.js`)

**Là gì:** Module ghi dữ liệu xuống file JSON (đại diện cho DB) theo kiểu async, không block.

**Tại sao cần?** Trong Space-Based Architecture, DB chỉ là backup. Primary data nằm trong Redis. Nhưng nếu Redis restart thì mất data → cần ghi xuống DB để có thể restore.

---

## 3. Tại sao không dùng CSDL

### Vấn đề của CSDL truyền thống trong Flash Sale

```
1000 người cùng bấm "Mua ngay"
         │
         ▼
    Database ← bottleneck
    (chỉ xử lý được ~100 req/s)
         │
         ▼
    999 người phải chờ
    Hệ thống chậm, timeout
```

**Vấn đề cụ thể:**
- **Disk I/O chậm:** DB ghi xuống ổ cứng, mỗi lần ghi mất vài ms. 1000 req/s × vài ms = nghẽn cổ chai
- **Lock tranh chấp:** Khi giảm stock, DB phải lock row. 1000 người cùng lock 1 row → hàng đợi dài
- **Connection pool:** DB chỉ cho phép vài trăm connection đồng thời

### Giải pháp Space-Based

```
1000 người cùng bấm "Mua ngay"
         │
         ▼
    Redis (RAM) ← xử lý trong bộ nhớ
    (xử lý được 100,000+ req/s)
         │
         ▼
    Tất cả được xử lý ngay
    Sau đó ghi DB async (không block)
```

**Redis nhanh hơn DB vì:**
- Dữ liệu nằm trong RAM, không cần đọc ổ cứng
- Single-threaded nhưng non-blocking I/O
- Các lệnh như DECRBY là atomic (không cần lock phức tạp)
- Benchmark: Redis xử lý ~100,000 req/s, MySQL ~1,000-10,000 req/s

---

## 4. Dữ liệu lưu ở đâu

```
Tầng 1 — Local Cache (RAM của từng PU)
  Nhanh nhất, mất khi PU restart
  Dùng cho: product list, cart, stock (TTL ngắn)

Tầng 2 — Data Grid / Redis (RAM chung)
  Nhanh, chia sẻ giữa tất cả PU
  Dùng cho: tất cả dữ liệu hoạt động
  Mất khi Redis restart (nếu không config persistence)

Tầng 3 — Data Writer / File JSON (Disk)
  Chậm nhất, không mất khi restart
  Dùng cho: backup orders
  Ghi async, không block xử lý chính
```

**Trả lời câu hỏi "Dữ liệu có mất không?"**
- Nếu PU restart: Không mất (data vẫn trong Redis)
- Nếu Redis restart: Mất data trong RAM, nhưng orders đã được backup xuống `db/orders.json`
- Nếu cả Redis + server restart: Chạy lại `node shared/seed.js` để restore products/stock

---

## 5. Hướng dẫn chạy

### Yêu cầu
- Node.js >= 18
- Redis đang chạy (port 6379)

Cài Redis nếu chưa có:
```bash
# macOS
brew install redis && brew services start redis

# Ubuntu
sudo apt install redis-server && sudo systemctl start redis
```

### Chạy bình thường (1 máy)

```bash
# Terminal 1 — Backend
cd BE
npm install
node shared/seed.js    # Nạp data vào Redis
npm start              # Khởi động tất cả

# Terminal 2 — Frontend
cd FE
npm install
npm run dev
```

Mở **http://localhost:3000**

### Chạy demo LAN (nhiều máy)

**Máy chạy BE:**
```bash
cd BE
bash start-lan.sh
# Script tự in IP: ví dụ 192.168.1.100
```

**Mỗi máy chạy FE** — đổi `FE/.env`:
```
VITE_MW_URL=http://192.168.1.100:8080
```
Rồi:
```bash
cd FE
npm install
npm run dev
```

### Chạy Scale Mode (clone PU1)

```bash
cd BE
node shared/seed.js
npm run start:scale
```

Middleware sẽ round-robin giữa PU1-A:8081 và PU1-B:8091.

---

## 6. Kịch bản test

### Kịch bản 1 — Test cơ bản

**Mục tiêu:** Xác nhận luồng mua hàng hoạt động

**Bước:**
1. Mở http://localhost:3000
2. Đăng ký tài khoản mới
3. Vào trang Sản phẩm → chọn bất kỳ → bấm "Thêm vào giỏ"
4. Vào Giỏ hàng → bấm "Tiến hành thanh toán"
5. Điền thông tin → bấm "Đặt hàng"
6. Thấy trang "Đặt hàng thành công" với mã đơn hàng

**Kiểm tra stock giảm:**
- Quay lại trang chi tiết sản phẩm vừa mua
- Thấy số lượng còn lại đã giảm
- Góc trên header thấy badge "Data Grid" màu xanh = đang kết nối Redis

---

### Kịch bản 2 — Test hết hàng (2 máy)

**Mục tiêu:** Chứng minh khi 1 người mua hết, người kia không đặt được

**Chuẩn bị — chạy trên máy BE:**
```bash
cd BE
node -e "const r=require('./shared/redis'); r.set('stock:p3',2).then(()=>{console.log('Set stock AeroBook = 2');r.disconnect()})"
```

**Diễn ra:**
1. Máy A và Máy B cùng mở trang **AeroBook Pro 14"**
2. Cả 2 thấy: **"2 sản phẩm còn lại (live)"**
3. Máy A: thêm 2 vào giỏ → checkout → **"Đặt hàng thành công"**
4. Máy B: chờ 3 giây → thấy stock tự đổi thành **"Hết hàng"** → nút "Thêm vào giỏ" bị disable
5. Máy B cố checkout → nhận thông báo **"Hết hàng: AeroBook Pro 14": only 0 left"**

**Kết quả mong đợi:** Chỉ Máy A mua được, Máy B bị từ chối.

---

### Kịch bản 3 — Load test Postman

**Mục tiêu:** Giả lập 50 người mua liên tiếp, xem stock không bị âm

**Bước:**
1. Mở Postman
2. **Import** → chọn file `BE/postman/FlashSale_LoadTest.postman_collection.json`
3. Click **Run collection**
4. Đặt **Iterations = 50**, **Delay = 0ms**
5. Bấm **Run Flash Sale — Load Test**

**Quan sát:**
- Các request đầu: status 200, stock giảm dần
- Khi hết hàng: status 409, message "Insufficient stock"
- Stock không bao giờ xuống dưới 0

---

### Kịch bản 4 — Demo Scale

**Mục tiêu:** Chứng minh clone PU vẫn hoạt động, data nhất quán

```bash
cd BE
node shared/seed.js
npm run start:scale
```

**Quan sát terminal:**
```
PU1-A Product (primary) :8081
PU1-B Product (clone)   :8091
⚡ SCALE MODE: Round-Robin PU1-A / PU1-B
```

**Test:**
```bash
# Gọi /products 4 lần liên tiếp
# Middleware log sẽ thấy luân phiên :8081 và :8091
for i in 1 2 3 4; do curl -s http://localhost:8080/products | python3 -c "import sys,json;d=json.load(sys.stdin);print('Request $i: OK,',len(d),'products')"; done
```

Cả 2 PU1 đều trả về cùng data vì cùng đọc Redis.

---

## 7. Câu hỏi thường gặp

**Q: Tại sao gọi là Space-Based Architecture?**
> "Space" ở đây là "tuple space" — không gian dữ liệu dùng chung trong RAM. Các Processing Unit không giao tiếp trực tiếp với nhau mà thông qua không gian dữ liệu chung này (Redis).

**Q: Redis có phải là database không?**
> Redis là in-memory data store — lưu dữ liệu trong RAM. Nó có thể hoạt động như cache, message broker, hoặc primary database. Trong project này dùng như Data Grid (primary storage), không phải cache của DB.

**Q: Nếu Redis bị tắt thì sao?**
> FE sẽ fallback về localStorage (chế độ offline). Orders đã đặt trước đó được backup trong `db/orders.json`. Khi Redis khởi động lại, chạy `node shared/seed.js` để restore products/stock.

**Q: Tại sao mỗi PU có Local Cache riêng?**
> Giảm số lần hit Redis. Nếu 1000 req/s hỏi danh sách sản phẩm, không cần hỏi Redis 1000 lần. Local Cache giữ kết quả 30 giây, chỉ hỏi Redis 2 lần/phút. Khi stock thay đổi, Messaging Grid thông báo để xóa cache.

**Q: SETNX là gì, tại sao cần?**
> SETNX = SET if Not eXists. Dùng để tạo distributed lock. Khi 2 request cùng muốn giảm stock, chỉ 1 cái được set key `lock:stock:p1`. Cái còn lại thấy key đã tồn tại → biết đang có người xử lý → chờ hoặc retry. Tránh oversell.

**Q: Queue khác Pub/Sub như thế nào?**
> - **Pub/Sub (Messaging Grid):** Broadcast — 1 publisher, nhiều subscriber nhận cùng lúc. Nếu subscriber offline thì mất message.
> - **Queue (Order Queue):** Point-to-point — message được lưu trong Redis List, worker lấy ra xử lý tuần tự. Nếu worker offline thì message vẫn còn trong queue, xử lý sau.

**Q: Tại sao FE chỉ cần biết địa chỉ Middleware?**
> Đây là nguyên tắc "single entry point". FE không cần biết có bao nhiêu PU, chúng ở đâu, có bị scale hay không. Middleware lo việc đó. Nếu sau này thêm PU5, FE không cần thay đổi gì.

**Q: Data Writer ghi xuống file JSON, thực tế dùng gì?**
> Trong project này dùng file JSON để đơn giản hóa (không cần cài thêm DB). Thực tế sẽ thay bằng PostgreSQL, MongoDB, hoặc bất kỳ DB nào. Logic không thay đổi — vẫn ghi async sau khi đã xử lý xong trong Redis.

**Q: Tại sao stock polling 3 giây thay vì real-time WebSocket?**
> WebSocket cần maintain connection liên tục, phức tạp hơn. Polling 3 giây đủ cho demo Flash Sale — user thấy stock cập nhật gần như real-time mà không cần infrastructure phức tạp.

**Q: Nếu PU3 crash giữa chừng khi đang checkout thì sao?**
> Đây là vấn đề distributed transaction. Trong project này chưa xử lý hoàn toàn. Thực tế cần implement saga pattern hoặc 2-phase commit. Tuy nhiên vì stock giảm và order tạo trong cùng 1 Redis pipeline, khả năng partial failure rất thấp.

**Q: Hazelcast khác Redis như thế nào?**
> Cả 2 đều là in-memory data grid. Redis đơn giản hơn, phổ biến hơn, dễ cài. Hazelcast là Java-based, hỗ trợ distributed computing tốt hơn, có thể chạy embedded trong ứng dụng Java. Project này dùng Redis vì Node.js và dễ setup hơn.
